const ENDPOINT_URL = "https://ashypls.com/endpoints/apis/pogsquadprofs/v3"

export interface Recipe {
  recip_id: number
  char_name: string
  char_realm: string
  prof_name: string
  prof_type: string
  recip_name: string
}

export type UniqueRecipe = Pick<Recipe, "recip_name" | "prof_name">;

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);

  return response.json();
}

export async function getGuildRecipes() {
  return await fetchApi<Array<Recipe>>(`${ENDPOINT_URL}/Guild_Recipies_All`)
}

export async function getGuildRecipesUnique() {
  return await fetchApi<Array<UniqueRecipe>>(`${ENDPOINT_URL}/Guild_Recipies_Unique`)
}

export async function getProfessionIcons(profType: string) {
  return await fetchApi(`https://ashypls.com/wowzers/img/prof_icons/${profType}.jpg`)
}
