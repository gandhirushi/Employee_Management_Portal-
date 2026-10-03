/**
 * Serializes a JavaScript object into a multipart/form-data FormData instance.
 * Automatically appends files with their appropriate form field name.
 */
export function toFormData(data, fileKey = 'photoFile', fileFieldName = 'photo') {
  const formData = new FormData();
  if (!data || typeof data !== 'object') return formData;

  Object.keys(data).forEach((key) => {
    const val = data[key];
    if (key === fileKey && val instanceof Blob) {
      formData.append(fileFieldName, val);
    } else if (val !== undefined && val !== null && key !== fileKey) {
      formData.append(key, val);
    }
  });

  return formData;
}
