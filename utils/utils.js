exports.DATE_UTILS = {
  stringDate1: (date) =>
    `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${(
      "0" + date.getDate()
    ).slice(-2)}`,
  dateToStringForWeb: (date) =>
    `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`,
  dateTimeToStringForWeb: (date) =>
    `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(
      -2
    )}:${("0" + date.getSeconds()).slice(-2)} ngày ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`,
  DateToHourString: (date) =>
    `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(
      -2
    )}:${("0" + date.getSeconds()).slice(-2)}`,
  hourToString: (date) => {
    const dateUTC = new Date(
      date + (new Date().getTimezoneOffset() - 60) * 60000
    );

    return `${("0" + dateUTC.getHours()).slice(-2)}:${(
      "0" + dateUTC.getMinutes()
    ).slice(-2)}:${("0" + dateUTC.getSeconds()).slice(-2)}`;
  },
};
