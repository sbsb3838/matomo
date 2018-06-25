/*!
 * Matomo - free/libre analytics platform
 *
 * ActionsDataTable screenshot tests.
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 */

describe("ActionsDataTable", function () {
    const url = "?module=Widgetize&action=iframe&idSite=1&period=year&date=2012-08-09&moduleToWidgetize=Actions&actionToWidgetize=getPageUrls&isFooterExpandedInDashboard=1";

    it("should load correctly", async function() {
        await page.goto(url);
        await page.waitForNetworkIdle();

        expect(await page.screenshot({ fullPage: true })).to.matchImage('initial');
    });

    it("should sort column correctly when column header clicked", async function() {
        await page.click('th#avg_time_on_page');
        await page.waitForNetworkIdle();
        expect(await page.screenshot({ fullPage: true })).to.matchImage('column_sorted');
    });

    it("should load subtables correctly when row clicked", async function() {
        await $('tr.subDataTable:first').click();
        await $('tr.subDataTable:eq(2)').click();
        expect(await page.screenshot({ fullPage: true })).to.matchImage('subtables_loaded');
    });

    it("should show configuration options", async function() {
        await page.click('.dropdownConfigureIcon');
        const element = await page.$('.tableConfiguration');
        expect(await element.screenshot()).to.matchImage('configuration_options');
    });

    it("should flatten table when flatten link clicked", async function() {
        await page.click('.dataTableFlatten');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('flattened');
    });

    it("should exclude low population rows when exclude low population link clicked", async function() {
        await page.click('.dropdownConfigureIcon');
        await page.click('.dataTableExcludeLowPopulation');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('exclude_low_population');
    });

    it("should load normal view when switch to view hierarchical view link is clicked", async function() {
        await page.click('.dropdownConfigureIcon span');
        await page.click('.dataTableFlatten');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('unflattened');
    });

    it("should display pageview percentages when hovering over pageviews column", async function() {
        await page.mouseMove('tr:contains("thankyou") td.column:eq(1)');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('pageview_percentages');
    });

    it("should generate a proper title for the visitor log segmented by the current row", async function() {
        const row = 'tr:contains("thankyou") ';
        await page.mouseMove(row + 'td.column:first');
        await page.mouseMove(row + 'td.label .actionSegmentVisitorLog');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('segmented_visitor_log_hover');
    });

    it("should open the visitor log segmented by the current row", async function() {
        await page.evaluate(function(){
            $('tr:contains("thankyou") td.label .actionSegmentVisitorLog').click();
        });
        const element = await page.$('.ui-dialog');
        expect(await element.screenshot()).to.matchImage('segmented_visitor_log');
    });

    it("should display unique pageview percentages when hovering over unique pageviews column", async function() {
        await page.click('.ui-widget .ui-dialog-titlebar-close');
        await page.mouseMove('tr:contains("thankyou") td.column:eq(2)');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('unique_pageview_percentages');
    });

    it("should show the search when clicking on the search icon", async function() {
        await page.click('.dataTableAction.searchAction');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('search_visible');
    });

    it("should search through table when search input entered and search button clicked and input should be visible", async function() {
        await page.sendKeys('.searchAction .dataTableSearchInput', 'i');
        await page.click('.searchAction .icon-search');
        await page.mouseMove('#logo');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('search');
    });

    it("should close search when clicking on the x icon", async function() {
        page.click('.searchAction .icon-close');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('search_closed');
    });

    it("should automatically expand subtables if it contains only one folder", async function() {
        await page.goto(url + '&viewDataTable=table');
        await page.click('tr .value:contains("blog")');
        await page.click('tr .value:contains("2012")');
        expect(await page.screenshot({ fullPage: true })).to.matchImage('auto_expand');
    });
});
