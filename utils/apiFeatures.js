/* eslint-disable node/no-unsupported-features/es-syntax */

class APIFeatures {
  //this api takes query method(query) of diff models and using req.query(query.string) it adds diff query methods to query //using this class we can create 'features ' object which has query field (query of all methods)
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1a)Filtering
    const queryObj = { ...this.queryString }; //shollow copy of query object
    const exludedFields = ['sort', 'page', 'limit', 'fields'];
    exludedFields.forEach((el) => delete queryObj[el]); //exluding certian fields from query object

    //1b)Advanced filtering using gte,gt,lte,lte
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    const AdvancedQueryObj = JSON.parse(queryStr);

    this.query = this.query.find(AdvancedQueryObj); //adding query methods to query

    return this; //by returning this it makes chaining of diff methods on objects becomes possibles//because if return this object then only we can add diff query methods to it by chaing diff query methods
  }

  sort() {
    if (this.queryString.sort) {
      // console.log(this.queryString.sort); //output=>price,duration  //in order to sort using multiple values we need 'query.sort('price duration') //so we need to make that coma into space
      const sortBy = this.queryString.sort.split(',').join(' '); //bcz url

      // console.log(sortBy); //output=>price duration
      // query.sort(this.queryString.sort);//to make sort in decreasing order add minus to value in url eg: http://localhost:3000/api/v1/tours?sort=-price
      this.query = this.query.sort(sortBy);
      //we can sort by multiple values first by price then by duration eg:http://localhost:3000/api/v1/tours?sort=price,duration
    } else {
      //default sorting in decreasing order of dates of creation
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' '); //making string of feilds with space between them

      this.query = this.query.select(fields); //looks like- this.query.select('name duration price') for eg-http://localhost:3000/api/v1/tours?fields=name,duration,price
    } else {
      //defulat condition exluding __v filed in the output//to exlude add minus to value
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; //page in number form with 1st page as default
    const limit = this.queryString.limit * 1 || 100; //limit in number form with 100 as defaul
    const skip = (page - 1) * limit; //calculating skip value to skip (page-1)*limit no.of documents to display the page
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
