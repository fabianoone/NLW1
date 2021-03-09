import { Knex } from 'knex'
export async function up(knex: Knex) {
    return knex.schema.createTable('items', items => {
        items.increments('id').primary();
        items.string('image').notNullable();
        items.string('title').notNullable();
    });
}
export async function down(knex: Knex) {
    return knex.schema.dropTable('items');
}