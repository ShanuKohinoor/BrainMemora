// AWS command used to upload a file and get an existing file from S3
import { PutObjectCommand,GetObjectCommand,DeleteObjectCommand } from "@aws-sdk/client-s3";
// S3 client configured for our AWS region
import { s3Client } from "../config/s3.js";
// Used to create a temporary secure URL for a private S3 file
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


// Name of the S3 bucket where BrainMemora files are stored c
const BUCKET_NAME = "brainmemora-learning-files-669492347903-eu-west-2-an"


// Upload a file from the backend to AWS S3
     export const uploadToS3 = async(
       file:Express.Multer.File,
       customKey?:string
     )=>{

        const fileKey = customKey || file.originalname;

        const command = new PutObjectCommand({
        // Specify the S3 bucket
        Bucket: BUCKET_NAME,
        // Name used to identify the file inside the bucket
        Key: fileKey,
        // Actual file data received from Multer
        Body: file.buffer,
        // To tell S3 what type of file is being uploaded
        ContentType: file.mimetype
    })
    // Send the upload command to AWS S3
    await s3Client.send(command)
    // Return the uploaded file name
    return fileKey
}






// Generate a temporary secure URL for a private S3 file
export const getFileUrl = async (
    fileName: string
) => {
    // Create a command to access the requested S3 object
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        // Identify the file inside the bucket
        Key: fileName
    })
    // Generate a temporary signed URL for the private file
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: 3600
    })
    // Return the generated temporary URL
    return url
}








// Delete a file from AWS S3
 export const deleteFromS3 = async(fileKey:string)=>{

        // Create a delete command for the specific S3 object
           const command = new DeleteObjectCommand({
             Bucket: BUCKET_NAME,
             Key:fileKey
           })

           // Send the delete request to AWS S3 to delete from there
           await s3Client.send(command)
 }




 // Download a file from S3 so BrainMemora can read its contents.
export const downloadFileFromS3 = async (
    fileKey: string
): Promise<Buffer> => {

    // Find the file in the existing S3 bucket.
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey
    });

    // Ask AWS S3 to return the file.
    const response = await s3Client.send(command);

    // Stop if S3 did not return any file data.
    if (!response.Body) {
        throw new Error("Could not download file from S3");
    }

    // Convert the downloaded data into a Buffer.
    const bytes = await response.Body.transformToByteArray();

    // Return the PDF data to the caller.
    return Buffer.from(bytes);
};