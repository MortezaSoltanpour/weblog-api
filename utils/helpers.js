exports.truncate = (str, len) => {
  if (str.length > len && str.length > 0) {
    let new_str = str + " ";
    new_str = str.substr(0, len);
    new_str = str.substr(0, new_str.lastIndexOf(" "));
    new_str = new_str.length > 0 ? new_str : str.substr(0, len);
    return new_str + "...";
  }
  return str;
};

exports.correctUrl = (url) => {
  url = url
    .replace(" ", "-")
    .replace("/", "-")
    .replace("@", "-")
    .replace("!", "-")
    .replace("#", "-")
    .replace("$", "-")
    .replace("%", "-")
    .replace("&", "-")
    .replace("+", "-")
    .replace("*", "-");
  return url;
};

exports.replaceAll = (str, search, replace) => {
  return str.split(search).join(replace);
};
