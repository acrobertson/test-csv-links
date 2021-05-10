# TEST CSV Links

This is a little script that parses a CSV file for a list of URLs and then uses Playwright to check for redirects and response errors.

## Limitations

This was created up for a very specific need. Limitations:

- It assumes the URLs are in a column of the CSV named `staging url`
- It assumes the site has basic auth
- It is very slow. I need to come back and see if the Playwright requests can be made asynchrounously. I'm sure I did something wrong.

When I find some free time, I'll polish this up so it'll be slightly more useful for other sitations requiring testing URLs in a CSV.

## Usage

1. Fork/Clone
2. `npm install`
3. Put the basic auth credentials in a `.env`. Use the `.env.example` for reference.
4. From the directory, run `node ./ [path-to-csv]`

For example, you may want to add an `input` directory in the project.

```zsh
# from .../test-csv-links
# CSV file is in ./input/example.csv
node . ./input/example.csv
```

This will write 2 files to the `output` directory: `successes.txt` and `errors.txt`
