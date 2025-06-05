import React from "react";

data = [
  {
    projectname: "Project Name",
    folders: [
      {
        foldername: "Folder 1",
        subfolders: [
          {
            subfoldername: "Subfolder 1",
            files: [
              { filename: "File 1", filetype: "text" },
              { filename: "File 2", filetype: "image" },
            ],
          },
          {
            subfoldername: "Subfolder 2",
            files: [{ filename: "File 3", filetype: "video" }],
          },

          //all other 28 sub folders
        ],
      },
      {
        foldername: "Folder 2",
        files: [
          { filename: "File 4", filetype: "audio" },
          { filename: "File 5", filetype: "document" },
        ],
      },
      {
        foldername: "Folder 3",
        files: [
          { filename: "File 6", filetype: "spreadsheet" },
          { filename: "File 7", filetype: "presentation" },
        ],
      },
      {
        foldername: "Folder 4",
        files: [
          { filename: "File 6", filetype: "spreadsheet" },
          { filename: "File 7", filetype: "presentation" },
        ],
      },
    ],
  },
];
function page() {
  return <div></div>;
}

export default page;

