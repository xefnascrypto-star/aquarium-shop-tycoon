module.exports=async page=>{if(await page.locator('#shopCreation').count()){await page.locator('#shopName').fill('Tienda de pruebas');await page.locator('.start-shop').click()}};
