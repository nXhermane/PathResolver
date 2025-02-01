const fs = require("fs");
const path = require("path");

const removeEmptyDirs = (dir) => {
   const files = fs.readdirSync(dir);
   if (files.length > 0) {
      files.forEach((file) => {
         const fullPath = path.join(dir, file);
         if (fs.lstatSync(fullPath).isDirectory()) {
            removeEmptyDirs(fullPath);
         }
      });
   } else {
      fs.rmdirSync(dir);
   }
};

// Exécuter le script pour nettoyer 'dist/types'
removeEmptyDirs(path.resolve(__dirname, "dist"));
