import { UserService } from "../model.service/UserService";
import { Buffer } from "buffer";
import {
  AuthenticationPresenter,
  AuthenticationView,
} from "./AuthenticationPresenter";

export interface RegisterView extends AuthenticationView {
  setImageUrl: (url: string) => void;
  setImageBytes: (bytes: Uint8Array) => void;
  setImageFileExtension: (extension: string) => void;
  clearImage: () => void;
}

export class RegisterPresenter extends AuthenticationPresenter<RegisterView> {
  private userService: UserService;

  public constructor(view: RegisterView) {
    super(view);
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

    let isSuccessful = false;

    await this.doFailureReportingOperation(
      async () => {
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
        isSuccessful = true;
      },
      "process image",
      () => {
        if (!isSuccessful) {
          this.view.clearImage();
        }
      }
    );
  }

  public async doRegister(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    imageBytes: Uint8Array,
    imageFileExtension: string,
    rememberMe: boolean
  ): Promise<void> {
    await this.doAuthenticationOperation(
      () =>
        this.userService.register(
          firstName,
          lastName,
          alias,
          password,
          imageBytes,
          imageFileExtension
        ),
      rememberMe,
      "register user",
      (user) => `/feed/${user.alias}`
    );
  }

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
