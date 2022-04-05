const { Model, INTEGER, STRING, TEXT } = require('sequelize')

class User extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255)
  }
  static tableName = "Buyer"
}

class Phone extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255),
    type: STRING(255)
  }

  static tableName = "Phone"
}

class File extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    title: STRING(255),
    content: TEXT("medium"),
    ownerId: INTEGER
  }
  static tableName = "Birth_Auth"
}


class Goods extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255),
    ownerId: INTEGER
  }
  static tableName = "Goods"
}

class Movie extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    name: STRING(255),
    fee: INTEGER
  }

  static tableName = "Movie"
}

class Actor extends Model {
  static attributes = {
    id: {
      field: 'id',
      autoIncrement: true,
      primaryKey: true,
      type: INTEGER
    },
    sex: STRING(255),
    name: STRING(255)
  }

  static tableName = 'Actor'
}

class MovieActor extends Model {
  static attributes = {
    actorId: INTEGER,
    movieId: INTEGER
  }

  static tableName = 'MovieActor'
}

module.exports = {
  User,
  Goods,
  File,
  Phone,
  Movie,
  Actor,
  MovieActor
}