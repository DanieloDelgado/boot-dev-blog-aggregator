# boot-dev-blog-aggregator
Blog Aggregator project which comunicates with a PosgrestSQL DB.

## Configuration
Create `.gatorconfig.json` file in your home directory and add the connection credentials for the PostgreSQL database. For example:
```json
{
  "db_url": "postgres://user:pass@localhost:5432/gator?sslmode=disable",
}
```
## Commands

List of commands

- `npm run start login`: sets the current user in the config
- `npm run start register`: adds a new user to the database
- `npm run start users`: lists all the users in the database
- `npm run start reset`: resets the database
- `npm run start reset`: resets the database
- `npm run start agg`: runs the aggregator periodically to retrieve all the feeds
- `npm run start addfeed`: adds a new feed
- `npm run start feeds`: lists all the feeds in the database
- `npm run start follow`: the current user follows a feed
- `npm run start unfollow`: the current user unfollows a feed
- `npm run start browse`: shows the latests posts in the database for the current user
