import { sortActiveFileProperties } from "src/lib/helpers/properties";
import type { Config } from "./config";

/**
 * Carnelianのフォーマットルールに沿ってフォーマットする
 */
export function formatProperties(settings: Config["formatter"]) {
  const {
    propertyOrder = ["title", "created", "updated"],
    removeIfEmpty = true,
  } = settings ?? {};

  sortActiveFileProperties(propertyOrder, {
    removeIfEmpty,
  });
}
