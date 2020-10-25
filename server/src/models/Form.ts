import {DATE, INTEGER, Model, Optional, Sequelize, STRING} from 'sequelize'

const sequelize: Sequelize = require('../config/db')

export interface FormAttributes {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

interface FormCreationAttributes extends Optional<FormAttributes, "id"> {
}

class FormModel extends Model<FormAttributes, FormCreationAttributes> implements FormAttributes {
    public id!: number;
    public title!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;
}

FormModel.init({
    id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
    },
    title: {
        type: STRING(50),
    },
    createdAt: {
        type: DATE
    },
    updatedAt: {
        type: DATE
    }
}, {tableName: 'forms', sequelize})

export const Form = FormModel;

