* console.log(new Date().getTime());
* console.log(new Date(1677872681000).toLocaleString());

const unixTimestamp = 1677872681
const milliseconds = unixTimestamp * 1000 
const dateObject = new Date(1677872681 * 1000)
console.log(dateObject)