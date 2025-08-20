import aws from 'aws-sdk';
import { env } from 'process';
import path from 'path';

// Environment variables are now provided by AWS Elastic Beanstalk
// Only load dotenv for local development
if (process.env.NODE_ENV === 'development' || process.env.ENV === 'LOCAL') {
  const dotenv = await import('dotenv');
  dotenv.config({ path: './.env' });
}


aws.config.update({
  secretAccessKey: env.BUCKET_SECRET_ACCESS_KEY,
  accessKeyId: env.BUCKET_ACCESS_KEY_ID,
  region: env.BUCKET_S3_ZONE,
});


const s3 = new aws.S3();

const uploadToS3Image = async ({ file, platform, folder, brand }) => {
  const pltfrm = ['admin','vendor'].includes(platform) ? platform : 'admin'
  let bucketData = {
    bucketPath: `image/admin/${folder}`,
    userName: `${folder}Img` ,
  };
  if(pltfrm==='vendor'){
    bucketData.bucketPath = `image/vendor/${brand.toLowerCase()}/${folder}`
  }

  const params = {
    Bucket: env.S3_IMAGE_BUCKET,
    ACL: 'public-read',
    Key:
      `${bucketData.bucketPath + '/'}` +
      `${bucketData.userName}-${Date.now()}${path.extname(file.originalname)}`,
    Body: file.buffer,
  };

  const awsObj = await s3.upload(params).promise();
  return awsObj?.Key ? awsObj.Key.slice(6) : awsObj?.key ? awsObj.key.slice(6) : ''
};

const deleteFromS3Image = (imagekey) => {
  let imageUrl = `image/${imagekey}`
  s3.deleteObject({ Bucket: env.S3_IMAGE_BUCKET, Key: imageUrl }).promise();
  return s3
    .deleteObject({ Bucket: env.S3_IMAGE_BUCKET, Key: imageUrl })
    .promise();
};

// const resize = async (file, width, height) => {
//   return await sharp(file.buffer).resize(width, height,{
//     fit: 'fill',
// }).toBuffer();
// }

// const newThumbnail=(file, buffer) => {
//   let thumbnail = file;
//   thumbnail.buffer = buffer;
//   thumbnail.size = thumbnail.buffer.length;
//   return thumbnail;
// }

export { uploadToS3Image, s3, deleteFromS3Image };
