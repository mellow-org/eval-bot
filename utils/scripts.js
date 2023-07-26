/**
 * Converts a hexadecimal color string or an integer color representation to another representation.
 * If the input is not a valid hexadecimal color or integer, it throws an Error.
 * @author mellow-org
 * @function
 * @param {string|number} color - The color to convert. It can be a hexadecimal color string (e.g., "#FF0000" for red) or an integer color representation (e.g., 0xFF0000 for red).
 * @returns {number} The converted color as an integer. If the input is a valid hexadecimal color string, it returns the integer representation. If the input is a valid integer color representation, it returns the integer itself.
 * @throws {Error} If the input is not a valid hexadecimal color or integer.
 * @example
 * // Example usage with hexadecimal color string
 * const hexColor = "#00FF00";
 * const convertedColor = convertColor(hexColor); // Returns: 65280
 *
 * @example
 * // Example usage with integer color representation
 * const intColor = 0x0000FF;
 * const convertedColor = convertColor(intColor); // Returns: 255
 *
 * @example
 * // Example usage with an invalid color
 * const invalidColor = "not_a_color";
 * try {
 *   const convertedColor = convertColor(invalidColor); // Throws an Error
 * } catch (error) {
 *   console.log(error.message); // Logs: "Invalid color: not_a_color"
 * }
 */
function convertColor(color) {
    const hexRegex = /^(#|0x)?([0-9A-F]{6})$/i;

    if (typeof color === "number" && color >= 0 && color <= 0xFFFFFF && Number.isInteger(color)) {
        return color;
    } else if (typeof color === "string" && hexRegex.test(color)) {
        const [, , hexCode] = color.match(hexRegex);
        return parseInt(hexCode, 16);
    }

    throw new Error(`Invalid color: ${color}`);
}

const fs = require("fs").promises;
const path = require("path");
async function findCommandFile(commandName) {
    const commandsDir = path.join(process.cwd(), "commands");
    const subdirectories = await fs.readdir(commandsDir, { withFileTypes: true });
  
    const rootFilePath = path.join(commandsDir, `${commandName}.js`);
    if (await fileExists(rootFilePath)) {
      return rootFilePath;
    }
  
    for (const subdir of subdirectories) {
      if (subdir.isDirectory()) {
        const subcommandsDir = path.join(commandsDir, subdir.name);
        const subFilePath = path.join(subcommandsDir, `${commandName}.js`);
        if (await fileExists(subFilePath)) {
          return subFilePath;
        }
      }
    }
  
    return null;
  }
  
  async function fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  const winston = require("winston");
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
      }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] [${level}]: ${message}`;
      })
    ),
    transports: [new winston.transports.Console()],
  });


module.exports = { convertColor, findCommandFile, fileExists, logger };
