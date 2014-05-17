## Octotree (modified by vakata)

The original extension is available at: [https://github.com/buunguyen/octotree](https://github.com/buunguyen/octotree) - kudos to buunguyen for creating it - I just decided to add a few useful features, that I am not sure will be merged in the original project:

* navigation in the page is registered and reflected on the tree
* panel can be switched to left or to the right 
* panel can be resized (the size is stored per repository)
* per repository visibility setting
* gists are ignored
* token can be changed at any time
* added tree scrollbars for large trees
* added loading indicator
* updated jstree, pulling data & sorting is done by jstree, fixed a bug with state saving

Browser extensions (Chrome & Firefox) to display GitHub code in tree format. Useful for developers who frequently read source in GitHub and do not want to download or checkout too many repositories. Features:

* Easy-to-navigate code tree like IDEs
* Fast browsing with pjax
* Support private repositories (require [personal access token](#github-api-rate-limit))

## GitHub API Rate Limit
Octotree uses [GitHub API](https://developer.github.com/v3/) to retrieve repository metadata. By default, it makes unauthenticated requests to the GitHub API. However, there are two situations when requests must be authenticated:

* You access a private repository
* You exceed the [rate limit of unauthenticated requests](https://developer.github.com/v3/#rate-limiting)

When that happens, Octotree shows the screen below to ask for your [GitHub personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use). If you don't already have one, [create one](https://github.com/settings/tokens/new), then copy and paste it into the textbox.

## Credit
* [Icon](https://github.com/pstadler/octofolders) by [pstadler](https://github.com/pstadler)