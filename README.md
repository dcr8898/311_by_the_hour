# 311 by the Hour
A visual exploration of NYC 311 call data by complaint type and the hour of the day in which calls were placed.

## What is it?
A while ago I saw [this amazing article](http://www.wired.com/2010/11/ff_311_new_york/all/1) in *Wired*.  The basic idea was to start with a week's worth of [NYC 311](http://www1.nyc.gov/311/about-311.page) call data, collect the data based on the category of the 311 complaint type, and then show what complaints were made by the hour of the day in which the calls were placed.  I found the results to be visually stunning. Don't you?  All credit for the concept go to Steven Johnson, the author of the article.

A little digging (okay, a google search) revealed that the 311 data is freely available from the [NYC OpenData service](https://nycopendata.socrata.com/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9), so I thought, "I bet I can do that! :wink:" (Yes, I sometimes think in emojis.)

## Why?
1. Why not?
2. As an exercise in writing JavaScript using a module code organization strategy.
3. To see if I could push the awesome [Highcharts](http://www.highcharts.com/) libary into uncharted territory. (Um, yeah . . . the pun was intended . . . sorry.)

## How?
1. [Highcharts](http://www.highcharts.com/) (of course)
2. [jQuery](http://jquery.com/) (it's a Highcharts dependency, so why not?)
3. Lots of JavaScript.
4. 13M+ rows of data from [NYC OpenData](https://nycopendata.socrata.com/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9).

## Details & Hurdles
The main hurdle was to teach Highcharts a new trick: while Highcharts' portfolio has lots of cool formats like area-spline, and multiple stacking effects, it did not offer the kind of "floating stack" I needed here. How to use Highcharts' existing features to obtain the effect I wanted? My solution is explained in detail in [this article](#). Basically my approach is a variation on the standard algorithm for centering text in a fixed-width column: "pad" the text with a number of spaces equal to (column.width - text.length) / 2. In my case, I added a last, hidden data series to my chart that essentially bumps up the the data stack at a given xAxis value by an appropriate amount to center the stack on the yAxis. You know what, just read [the article](#). It has pictures and code examples and everything.

## What's next?
1. I would **_love_** to find a way to speed up the data retrieval from the NYC OpenData servers. Suggestions welcome!
2. Maybe fork Highcharts and add a 'floating' stacking type . . .
