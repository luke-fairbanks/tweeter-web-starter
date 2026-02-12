import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model.service/UserService";
import { Buffer } from "buffer";

export interface RegisterView {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User,
    authToken: AuthToken,
    remember: boolean
  ) => void;
  displayErrorMessage: (message: string) => void;
  navigate: (url: string) => void;
  setImageUrl: (url: string) => void;
  setImageBytes: (bytes: Uint8Array) => void;
  setImageFileExtension: (extension: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearImage: () => void;
}

export class RegisterPresenter {
    private view: RegisterView;
    private userService: UserService;

    public constructor(view: RegisterView) {
        this.view = view;
        this.userService = new UserService();
    }

    public isRegisterDisabled(
      firstName: string,
      lastName: string,
      alias: string,
      password: string,
      imageUrl: string,
      imageFileExtension: string
    ): boolean {
      return (
        !firstName ||
        !lastName ||
        !alias ||
        !password ||
        !imageUrl ||
        !imageFileExtension
      );
    }

    public async handleImageFile(file: File | undefined): Promise<void> {
      if (!file) {
        this.view.clearImage();
        return;
      }

      try {
        this.view.setImageUrl(URL.createObjectURL(file));

        const imageStringBase64 = await this.readAsDataUrl(file);
        const imageStringBase64BufferContents =
          imageStringBase64.split("base64,")[1] ?? "";

        const bytes: Uint8Array = Buffer.from(
          imageStringBase64BufferContents,
          "base64"
        );

        this.view.setImageBytes(bytes);

        const fileExtension = this.getFileExtension(file.name);
        this.view.setImageFileExtension(fileExtension ?? "");
      } catch (error) {
        this.view.displayErrorMessage(
          `Failed to process image because of exception: ${error}`
        );
        this.view.clearImage();
      }
    }

    public async doRegister (
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        imageBytes: Uint8Array,
        imageFileExtension: string,
        rememberMe: boolean
    ): Promise<void> {
    try {
      this.view.setIsLoading(true);
      const [user, authToken] = await this.userService.register(
        firstName,
        lastName,
        alias,
        password,
        imageBytes,
        imageFileExtension
      );

      this.view.updateUserInfo(user, user, authToken, rememberMe);
      this.view.navigate(`/feed/${user.alias}`);
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to register user because of exception: ${error}`
      );
    } finally {
      this.view.setIsLoading(false);
    }
  };

  private getFileExtension(fileName: string): string | undefined {
    return fileName.split(".").pop();
  }

  private readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        resolve((event.target?.result as string) ?? "");
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
