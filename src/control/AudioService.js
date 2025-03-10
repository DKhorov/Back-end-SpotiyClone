import NodeID3 from 'node-id3';
import * as mm from 'music-metadata';
import fs from 'fs';
import path from 'path';

export const getAudio = async (req, res) => {
  try {
    const { songName } = req.params;
    const filePath = path.join('./uploads', `${songName}`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    const ext = path.extname(filePath).toLowerCase();
    let metadata;

    if (ext === '.mp3') {
      metadata = await NodeID3.read(filePath);
    } else {
      metadata = await mm.parseFile(filePath);
    }

    if (!metadata) {
      return res.status(404).send('No metadata found');
    }

    return res.status(200).json({ metadata });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Error while getting audio metadata',
    });
  }
};

// используем отдельную функцию для проверки расширения файла ДО его сохранения
export const fileFilter = (req, file, cb) => {
  // допустимые расширения
  const allowedExtensions = ['.mp3', '.wav', '.vma', '.flac', '.mid', '.midi'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true); // отправляем файл далее на сохранение
  } else {
    cb(new Error('Недопустимое расширение файла'), false); // отклоняем, создавая ошибку
  }
};
