const fs = require('fs');
const path = require('path');

let sites = [];
let monuments = [];

function loadData() {
    try {
        const sitesData = fs.readFileSync(path.join(__dirname, '..', 'data', 'heritageSites.json'), 'utf8');
        sites = JSON.parse(sitesData);
        
        const monumentsData = fs.readFileSync(path.join(__dirname, '..', 'data', 'heritageMonuments.json'), 'utf8');
        monuments = JSON.parse(monumentsData);
        console.log(`Loaded ${sites.length} sites and ${monuments.length} monuments into knowledge base.`);
    } catch (error) {
        console.error("Error loading knowledge base data:", error);
    }
}

// Load data at startup
loadData();

function getAllSites() {
    return sites;
}

function getSiteById(siteId) {
    return sites.find(s => s.site_id === siteId);
}

function getMonumentsBySite(siteId) {
    return monuments.filter(m => m.site_id === siteId);
}

function getMonumentById(monumentId) {
    return monuments.find(m => m.monument_id === monumentId);
}

function searchMonuments(query) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    
    return monuments.filter(m => {
        return m.monument_name.toLowerCase().includes(lowerQuery) ||
               (m.alternate_names && m.alternate_names.some(name => name.toLowerCase().includes(lowerQuery))) ||
               (m.visual_identifiers && m.visual_identifiers.some(vi => vi.toLowerCase().includes(lowerQuery)));
    });
}

function getMonumentByIdentification(siteName, monumentName) {
    if (!siteName || !monumentName) return null;
    
    const lowerSiteName = siteName.toLowerCase();
    const lowerMonumentName = monumentName.toLowerCase();
    
    const site = sites.find(s => 
        s.site_name.toLowerCase() === lowerSiteName ||
        (s.alternate_names && s.alternate_names.some(an => an.toLowerCase() === lowerSiteName))
    );
    
    if (!site) return null;
    
    const siteMonuments = getMonumentsBySite(site.site_id);
    const monument = siteMonuments.find(m => 
        m.monument_name.toLowerCase().includes(lowerMonumentName) ||
        lowerMonumentName.includes(m.monument_name.toLowerCase()) ||
        (m.alternate_names && m.alternate_names.some(an => an.toLowerCase().includes(lowerMonumentName)))
    );
    
    return { site, monument };
}

function getAllMonuments() {
    return monuments;
}

module.exports = {
    getAllSites,
    getSiteById,
    getMonumentsBySite,
    getMonumentById,
    getAllMonuments,
    searchMonuments,
    getMonumentByIdentification
};
