import { Migration } from '@mikro-orm/migrations';

export class Migration20261110123258 extends Migration {

  override name = 'Migration20261110123258';

  override up(): void | Promise<void> {
    this.addSql(`create table "player" ("id" uuid not null, "name" varchar(255) not null, "email" varchar(255) not null, "created_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "player" add constraint "player_email_unique" unique ("email");`);

    this.addSql(`create table "transaction" ("id" uuid not null, "player_id" uuid not null, "type" text not null, "amount_cents" int not null, "created_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "transaction" add constraint "transaction_type_check" check ("type" in ('DEPOSIT', 'BET', 'WIN'));`);

    this.addSql(`alter table "transaction" add constraint "transaction_player_id_foreign" foreign key ("player_id") references "player" ("id");`);
  }

}
