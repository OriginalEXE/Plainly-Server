exports.up = async (knex) => {
  await knex.schema.createTable ('user', (table) => {
    table.uuid ('id').primary ();
    table.string ('email');
    table.string ('name');
    table.timestamp ('created_at').defaultTo (knex.fn.now ());

    table.unique ('email');
  });

  await knex.schema.createTable ('login', (table) => {
    table.uuid ('id').primary ();
    table.uuid ('user_id').references ('id').inTable ('user')
      .onDelete ('CASCADE')
      .onUpdate ('CASCADE');
    table.string ('type');
    table.string ('external_id');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTableIfExists ('user');
  await knex.schema.dropTableIfExists ('login');
};
