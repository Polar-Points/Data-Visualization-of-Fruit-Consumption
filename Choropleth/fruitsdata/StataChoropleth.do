* import the txt file from directory
cd /Users/qha/Desktop
insheet using "AllExp2013.txt", tab clear

* drop all data with marketproj == 0
drop if marketproj == 0

* calculate the cpi ratio, which is cpi_current/cpi_Jan-2011
gen cpi_ratio = 1.02509/cpi

* calculate nominal prices for conventional fruits, 
* which is price * cpi_ratio
replace capplep = capplep * cpi_ratio
replace cblackbp = cblackbp * cpi_ratio
replace cbluebp = cbluebp * cpi_ratio
replace cgrapep = cgrapep * cpi_ratio
replace cgrapefp = cgrapefp * cpi_ratio
replace clemonp = clemonp * cpi_ratio
replace corangep = corangep * cpi_ratio
replace craspbp = craspbp * cpi_ratio
replace cstrawp = cstrawp * cpi_ratio
replace cothp = cothp * cpi_ratio

* calculate nominal prices for organic fruits, 
* which is price * cpi_ratio
replace oapplep = oapplep * cpi_ratio
replace oblackbp = oblackbp * cpi_ratio
replace obluebp = obluebp * cpi_ratio
replace ograpep = ograpep * cpi_ratio
replace ograpefp = ograpefp * cpi_ratio
replace olemonp = olemonp * cpi_ratio
replace oorangep = oorangep * cpi_ratio
replace oraspbp = oraspbp * cpi_ratio
replace ostrawp = ostrawp * cpi_ratio
replace oothp = oothp * cpi_ratio

* calculate nominal expenditures for conventional fruits, 
* which is expenditure * cpi_ratio
replace capplee = capplee * cpi_ratio
replace cblackbe = cblackbe * cpi_ratio
replace cbluebe = cbluebe * cpi_ratio
replace cgrapee = cgrapee * cpi_ratio
replace cgrapefe = cgrapefe * cpi_ratio
replace clemone = clemone * cpi_ratio
replace corangee = corangee * cpi_ratio
replace craspbe = craspbe * cpi_ratio
replace cstrawe = cstrawe * cpi_ratio
replace cothe = cothe * cpi_ratio

* calculate nominal expenditures for organic fruits, 
* which is expenditures * cpi_ratio
replace oapplee = oapplee * cpi_ratio
replace oblackbe = oblackbe * cpi_ratio
replace obluebe = obluebe * cpi_ratio
replace ograpee = ograpee * cpi_ratio
replace ograpefe = ograpefe * cpi_ratio
replace olemone = olemone * cpi_ratio
replace oorangee = oorangee * cpi_ratio
replace oraspbe = oraspbe * cpi_ratio
replace ostrawe = ostrawe * cpi_ratio
replace oothe = oothe * cpi_ratio

* convert states and counties fips to strings
gen states = string(stfips)
gen counties = string(cntyfips)

* add leading 0s and concatenating states and counties codes 
* to make a valid fip
replace states = "0" + states if strlen(states) == 1
replace counties = "00" + counties if strlen(counties) == 1
replace counties = "0" + counties if strlen(counties) == 2
gen fips = states + counties

* sort the data by month, fips
sort month fips

* find the average price of conventional fruits in the same county 
* within the same month
collapse (mean) capplep cblackbp cbluebp cgrapep cgrapefp ///
clemonp corangep craspbp cstrawp cothp ///
oapplep oblackbp obluebp ograpep ograpefp ///
olemonp oorangep oraspbp ostrawp oothp ///
capplee cblackbe cbluebe cgrapee cgrapefe ///
clemone corangee craspbe cstrawe cothe ///
oapplee oblackbe obluebe ograpee ograpefe ///
olemone oorangee oraspbe ostrawe oothe, by (fips month)

