import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

//  Implement the fileStorage logic
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.ATTACHMENTS_S3_BUCKET


function getAttachmentUrl(todoID: string): string {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoID}`
  return attachmentUrl
}

 async function getSignedUrl(todoID: string): Promise<string> {
   return s3.getSignedUrl('putObject', {
     Bucket: bucketName,
     Key: todoID,
     Expires: 60000
   })
 }
  
  export const AttachmentUtils = { getAttachmentUrl, getSignedUrl }


