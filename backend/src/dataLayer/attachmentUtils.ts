import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

//  Implement the fileStorage logic
const s3 = new XAWS.S3({ signatureVersion: 'v4' })
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
<<<<<<< HEAD


function getAttachmentUrl(todoID: string): string {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoID}`
  return attachmentUrl
}
=======
const urlExpiration = process.env.SIGNED_URL_EXPIRATION


  function getAttachmentUrl(todoID: string): string {
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoID}`
    return attachmentUrl
  }
>>>>>>> dd310d9d2d681a4b0b31ac4983028c55aefb9435

 async function getSignedUrl(todoID: string): Promise<string> {
   return s3.getSignedUrl('putObject', {
     Bucket: bucketName,
     Key: todoID,
<<<<<<< HEAD
     Expires: 60000
=======
     Expires: urlExpiration
>>>>>>> dd310d9d2d681a4b0b31ac4983028c55aefb9435
   })
 }
  
  export const AttachmentUtils = { getAttachmentUrl, getSignedUrl }


