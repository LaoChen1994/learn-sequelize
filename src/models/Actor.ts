import { Model, INTEGER, STRING, HasManySetAssociationsMixin, HasManyGetAssociationsMixin } from 'sequelize'

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

  declare id: number;
  declare sex: string;
  declare name: string;

  declare setMovies: HasManySetAssociationsMixin<Movie, number>
  declare getMovies: HasManyGetAssociationsMixin<Movie>

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

  declare id: number;
  declare name: string;
  declare fee: number;

  declare getActors: HasManyGetAssociationsMixin<Actor>
  declare setActors: HasManySetAssociationsMixin<Actor, number>
}

class MovieActor extends Model {
  static attributes = {
    actorId: INTEGER,
    movieId: INTEGER
  }

  static tableName = 'MovieActor'
}


export {
  Actor,
  Movie,
  MovieActor
}