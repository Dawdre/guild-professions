const ENDPOINT_URL = "https://ashypls.com/endpoints/apis/pogsquadprofs/v3";
const ENDPOINT_EVENT_URL = "https://ashypls.com/endpoints/loaders/wowprofs.aspx";

export interface Recipe {
  recip_id: number
  char_name: string
  char_realm: string
  prof_name: string
  prof_type: string
  recip_name: string
  recip_tier_name: string
}

export interface Crafter {
  char_name: string
  char_realm: string
  char_class: string
  char_avatar: string
  class_color: string
  class_icon: string
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
  return await fetchApi<Array<Recipe>>(`${ENDPOINT_URL}/Guild_Recipes_All?realm=${realm}&guild=${guildName}`)
}

export async function getGuildRecipesUnique(realm: string, guildName: string) {
  return await fetchApi<Array<UniqueRecipe>>(`${ENDPOINT_URL}/Guild_Recipes_Unique?realm=${realm}&guild=${guildName}`)
}

export async function getGuildCrafters(realm: string, guildName: string) {
  return await fetchApi<GuildCrafters>(`${ENDPOINT_URL}/Guild_Crafters?realm=${realm}&guild=${guildName}`);
}

export async function getRealmList() {
  return await fetchApi<Array<Realm>>("https://ashypls.com/endpoints/apis/pogsquadprofs/realm_list/");
}

export async function getGuildInfo(realm: string, guildName: string) {
  return await fetchApi<GuildInfo>(`${ENDPOINT_URL}/Guild_Details?realm=${realm}&guild=${guildName}`);
}

export async function getProfessionIcons(profType: string) {
  return await fetchApi(`https://ashypls.com/wowzers/img/prof_icons/${profType}.jpg`)
}

export async function startStream(realm: string, guildName: string) {
  return new EventSource(`${ENDPOINT_EVENT_URL}?guildname=${guildName}&realm=${realm}`)
}
