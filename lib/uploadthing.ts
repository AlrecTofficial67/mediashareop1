import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models";
import { MAX_FILE_SIZE_FREE, MAX_FILE_SIZE_PREMIUM } from "@/lib/utils";

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    blob: { maxFileSize: "2GB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = getCurrentUser();
      if (!session) throw new Error("Unauthorized");
      await connectDB();
      const user = await UserModel.findById(session.userId).select("role storageUsed storageLimit").lean();
      if (!user || !(user as any).isActive) throw new Error("Account inactive");
      return { userId: session.userId, role: (user as any).role, storageUsed: (user as any).storageUsed, storageLimit: (user as any).storageLimit };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await connectDB();
      await UserModel.findByIdAndUpdate(metadata.userId, {
        $inc: { storageUsed: file.size },
      });
      return { fileKey: file.key, fileUrl: file.url, fileSize: file.size, fileName: file.name };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
