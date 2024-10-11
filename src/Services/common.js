const convertIDtoSmall = (id) => {
  //hash the id to a 2 digit number
  let number = 0;
  for (let i = 0; i < id.length; i++) {
    number += id.charCodeAt(i);
  }
  return number % 100;
};

const convertIDtoCode = (id) => {
  //hash the id to a 4 digit number
  let number = 0;
  for (let i = 0; i < id.length; i++) {
    number += id.charCodeAt(i);
  }
  return number % 100000;
};
const commonService = {
  handleID: (id) => {
    return convertIDtoSmall(id);
  },
  handleCode: (id) => {
    return convertIDtoCode(id);
  },
};

export default commonService;
