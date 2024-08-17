export function formatDateForConditions(dateString: string): string {
  // Parse the date string to a Date object
  const date = new Date(dateString);

  // Extract the components of the date
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Format the date as required for Access queries
  return `#${year}-${month}-${day} ${hours}:${minutes}:${seconds}#`;
}

export function formatDateForQueries(dateString: string): string {
  // Parse the date string to a Date object
  const date = new Date(dateString);

  // Extract the components of the date
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Format the date as 'YYYY-MM-DD HH:MM:SS'
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatDateToIso(dateString: string): string {
  // Split the date and time components
  const [datePart, timePart] = dateString.split(' ');

  // Parse the components into a Date object
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));

  // Format the date as ISO 8601
  return date.toISOString();
}

export function formatDateForAccess(dateString: string): string {
  // Ensure the input is a valid date string
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date string");
  }

  // Extract the components of the date
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Format the date as required for Access queries
  return `#${year}-${month}-${day} ${hours}:${minutes}:${seconds}#`;
}

export function formatOnlyDateForAccess(dateString: string): string {
  const datePart = dateString.split('T')[0];
  // Assuming dateString is in the format 'yyyy-mm-dd'
  const formattedDate = `#${datePart}#`;
  return formattedDate;
}

export function getDateAccessFormat(date: string) {
  const datePart = date.includes('T') ? date.split('T')[0] : (date.includes(' ') ? date.split(' ')[0] : null);
  return datePart;
}

// export function getDateFormat(date: string) {
//   const datePart = date.split('T')[0];
//   return datePart;
// }
