// Vercel rejects request bodies over 4.5 MB before they reach the server action,
// so uploaded documents must stay below that (with room for the multipart overhead).
export const maxDocumentationFileSizeMb = 4
export const maxDocumentationFileSize = maxDocumentationFileSizeMb * 1024 * 1024
export const documentationFileTooLargeMessage = `The file is too large. Please upload a file that is ${maxDocumentationFileSizeMb} MB or smaller.`
