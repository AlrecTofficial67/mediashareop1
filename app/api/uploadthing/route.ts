import { createRouteHandler } from "uploadthing/next";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/lib/auth";

const f = createUploadthing();

const fileRouter = {
  fileUploader: f({ blob: { maxFileSize: "2GB" } })
    .middleware(async () => {
      const session = getCurrentUser();
      if (!session) throw new Error("Unauthorized");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url, key: file.key, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof fileRouter;
export const { GET, POST } = createRouteHandler({ router: fileRouter });
