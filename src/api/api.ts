const ENDPOINT_URL = "https://ashypls.com/endpoints/apis/pogsquadprofs/v3";
const HOST_ENDPOINT_URL = "https://ashypls-001-site1.ftempurl.com/endpoints/guildprofs";

export interface Recipe {
  recip_id: number
  char_name: string
  char_realm: string
  char_guild_rank: number
  prof_name: string
  prof_type: string
  recip_name: string
  recip_tier_name: string
}

export interface RecipeDetails {
  id: number
  name: string
  iconURL: string
  reagents: Array<Reagent>
}

export interface Reagent {
  name: string
  count: number
  isCraftingModifier: boolean
}

export interface Crafter {
  char_name: string
  char_realm: string
  char_class: string
  char_race: string
  char_gender: string
  char_avatar: string
  char_guild_rank: number
  class_color: string
  class_icon: string
  total_known_recipes: number
  tier_list: Array<CrafterTierList>
}

export interface CrafterTierList {
  tier_name: string,
  recipe_count: number,
}

export interface GuildTiersKnown {
  crafting_tier_name: string,
}

export interface GuildCrafters {
  crafters: Array<Crafter>,
  guild_tiers_known: Array<GuildTiersKnown>,
}

export interface GuildInfo {
  name: string,
  id: string,
  faction: string,
  achievementPoints: number,
  memberCount: number,
  founded: string,
  factionIcon: string,
}

export interface Realm {
  key: { href: string },
  name: string,
  id: number,
  slug: string,
}

export type UniqueRecipe = Pick<Recipe, "recip_name" | "prof_name">;

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);

  return response.json();
}

export async function getGuildRecipes(realm: string, guildName: string) {
  return await fetchApi<Array<Recipe>>(`${HOST_ENDPOINT_URL}/V3/Guild_Recipes_All?realm=${realm}&guild=${guildName}`)
}

export async function getGuildRecipesUnique(realm: string, guildName: string) {
  return await fetchApi<Array<UniqueRecipe>>(`${HOST_ENDPOINT_URL}/V3/Guild_Recipes_Unique?realm=${realm}&guild=${guildName}`)
}

export async function getGuildCrafters(realm: string, guildName: string) {
  return await fetchApi<GuildCrafters>(`${HOST_ENDPOINT_URL}/V3/Guild_Crafters?realm=${realm}&guild=${guildName}`);
}

export async function getRealmList() {
  return await fetchApi<Array<Realm>>(`${HOST_ENDPOINT_URL}/realm_list/`);
}

export async function getGuildInfo(realm: string, guildName: string) {
  return await fetchApi<GuildInfo>(`${HOST_ENDPOINT_URL}/V3/Guild_Details?realm=${realm}&guild=${guildName}`);
}

export async function getRecipeDetails(recipeId: number) {
  return await fetchApi<RecipeDetails>(`${ENDPOINT_URL}/Recipe_Details?recipe_id=${recipeId}`);
}

export async function getProfessionIcons(profType: string) {
  return await fetchApi(`https://ashypls.com/wowzers/img/prof_icons/${profType}.jpg`)
}

export async function getDawdRealmList() {
  return await fetchApi<Array<Realm>>("http://localhost:8000/dawd/realms")
}