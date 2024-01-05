const ENDPOINT_URL = "https://ashypls.com/endpoints/apis/pogsquadprofs/v3";
const ENDPOINT_EVENT_URL = "https://ashypls.com/endpoints/loaders/wowprofs.aspx"

export interface Recipe {
  recip_id: number
  char_name: string
  char_realm: string
  prof_name: string
  prof_type: string
  recip_name: string
}

export interface Crafter {
  char_name: string
  char_realm: string
  char_class: string
  char_avatar: string
  class_color: string
  class_icon: string
}

export type UniqueRecipe = Pick<Recipe, "recip_name" | "prof_name">;

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);

  return response.json();
}

export async function getGuildRecipes(realm: string, guildName: string) {
  return await fetchApi<Array<Recipe>>(`${ENDPOINT_URL}/Guild_Recipies_All?realm=${realm}&guild=${guildName}`)
}

export async function getGuildRecipesUnique(realm: string, guildName: string) {
  return await fetchApi<Array<UniqueRecipe>>(`${ENDPOINT_URL}/Guild_Recipies_Unique?realm=${realm}&guild=${guildName}`)
}

export async function getGuildCrafters(realm: string, guildName: string) {
  return await fetchApi<Array<Crafter>>(`${ENDPOINT_URL}/Guild_Crafters?realm=${realm}&guild=${guildName}`);
}

export async function getProfessionIcons(profType: string) {
  return await fetchApi(`https://ashypls.com/wowzers/img/prof_icons/${profType}.jpg`)
}

export async function startStream(realm: string, guildName: string) {
  return new EventSource(`${ENDPOINT_EVENT_URL}?guildname=${guildName}&realm=${realm}`)
}
