const fs = require("fs/promises");
const path = require("path");

(async () => {
  const CREATE_FILe = "create a file";
  const DELETE_FILE = "delete the file";
  const RENAME_FILE = "rename the file";
  const ADD_TO_FILE = "add to the file";

  const createFile = async (path) => {
    try {
      const existingFileHandle = await fs.open(path, "r");
      existingFileHandle.close();
      return console.log(`The file in that path: ${path} already exist`);
    } catch (e) {
      // We dont have that file
      const newFileHandle = await fs.open(path, "w");
      console.log("A new file was succesfully created");
      newFileHandle.close();
    }
  };
  const deleteFile = async (path) => {
    try {
      await fs.unlink(path);
      console.log(`successfully deleted ${path}`);
    } catch (error) {
      console.log("there was an error:", error.message);
    }
  };

  const renameFile = async (oldPath, newPath) => {
    try {
      await fs.rename(oldPath, newPath);
      console.log(`successfully renamed ${oldPath} to ${newPath}`);
    } catch (error) {
      console.log("there was an error:", error.message);
    }
  };

  let addedContent;
  const addToFile = async (path, content) => {
    if (addedContent == content) {
      return;
    }
    try {
      const newFileHandle = await fs.open(path, "a");
      await newFileHandle.write(content);
      addedContent = content;
      console.log('The "data to append" was appended to file!');
      newFileHandle.close();
    } catch (error) {
      console.log("there was an error:", error.message);
    }
  };

  // Default flag: 'r' (read)
  const commandFileHandler = await fs.open("./command.txt", "r");

  commandFileHandler.on("changeFile", async () => {
    // get the size of our file
    const size = (await commandFileHandler.stat()).size;
    // allocate our buffer with the size of the file
    const buff = Buffer.alloc(size);
    // the location at which we want to start filling our buffer
    const offset = 0;
    // how many bytes we want to read
    const length = buff.byteLength;
    // the position that we want to start reading the file from
    const position = 0;

    // we always want to read the whole content (from beginning all the way to the end)
    await commandFileHandler.read(buff, offset, length, position);

    // decoder 01 => meaningful
    // encoder meaningful => 01

    // decoder
    const command = buff.toString("utf-8");
    if (command.includes(CREATE_FILe)) {
      const fileName = command.substring(CREATE_FILe.length + 1);
      createFile(fileName);
    }
    if (command.includes(DELETE_FILE)) {
      const filePath = command.substring(DELETE_FILE.length + 1);
      deleteFile(filePath);
    }
    if (command.includes(RENAME_FILE)) {
      const _idx = command.indexOf(" to ");
      const oldFilePath = command.substring(RENAME_FILE.length + 1, _idx);
      const newFilePath = command.substring(_idx + 4);
      renameFile(oldFilePath, newFilePath);
    }
    if (command.includes(ADD_TO_FILE)) {
      const _idx = command.indexOf(" this content: ");
      const filePath = command.substring(ADD_TO_FILE.length + 1, _idx);
      content = command.substring(_idx + 15);
      content = addToFile(filePath, content);
    }
  });

  // watcher...
  const watcher = fs.watch("./command.txt");
  for await (const event of watcher) {
    if (event.eventType === "change") {
      commandFileHandler.emit("changeFile");
    }
  }
})();
