const REDIS_URL = "redis: //h:pf690be02e58a359e52f474e48fdefe59d466ee8c68925e9960da990d6d49d9ad@ec2-52-7-17-124.compute-1.amazonaws.com:9299";
var client = require('redis').createClient(REDIS_URL);