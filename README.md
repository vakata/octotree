## Octotree (modified by vakata)

The original great extension by @buunguyen is available [here](https://github.com/buunguyen/octotree)

Browser extensions (Chrome & Opera & Firefox & Safari) to display the GitHub source code tree in a resizable sidebar. Private repositories are also supported.

### GitHub API Rate Limit
Octotree uses [GitHub API](https://developer.github.com/v3/) to retrieve repository metadata. By default, it makes unauthenticated requests to the GitHub API. However, there are two situations when requests must be authenticated:

* You access a private repository
* You exceed the [rate limit of unauthenticated requests](https://developer.github.com/v3/#rate-limiting)

When that happens [create an access token](https://github.com/settings/tokens/new), then copy and paste it into the textbox provided by octotree.
