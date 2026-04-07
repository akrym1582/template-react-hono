import { describe, expect, it } from "vitest";
import { SAMPLE_ITEMS_ROUTE } from "../../../../webapp/shared/constants/routes.js";
import { buildSampleItemsCsvUrl } from "../../../../webapp/client/hooks/use-sample-items.js";

describe("useSampleItems", () => {
  it("builds the export URL from shared sample item route constants", () => {
    expect(
      buildSampleItemsCsvUrl({
        keyword: "item",
        category: "general",
        cursor: "cursor-1",
        limit: 50,
      })
    ).toBe(
      `${SAMPLE_ITEMS_ROUTE.base}/${SAMPLE_ITEMS_ROUTE.export}?keyword=item&category=general&cursor=cursor-1&limit=50`
    );
  });
});
