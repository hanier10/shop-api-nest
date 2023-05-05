export const fileFilter = (req, file: Express.Multer.File, callback) => {
  if (!file) {
    return callback(new Error('Archivo vacío'), false);
  }

  const fileExtension = file.mimetype.split('/')[1];
  const validExtension = ['jpeg', 'jpg'];

  if (validExtension.includes(fileExtension)) {
    return callback(null, true);
  }

  callback(null, false);
};
