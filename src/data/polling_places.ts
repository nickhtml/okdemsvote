export interface PollingPlace {
  precinctId: string;
  precinctCode: string;
  precinctName: string;
  pollingLocation: string;
  locationDescription: string;
  address: string;
  city: string;
  zip: string;
  county: string;
}

export const pollingPlacesData: Record<string, PollingPlace> = {
  "010001": {
    precinctId: "22989",
    precinctCode: "010001",
    precinctName: "Precinct 010001",
    pollingLocation: "DAHLONEGAH SCHOOL",
    locationDescription: "",
    address: "468739 E 878 RD",
    city: "STILWELL",
    zip: "74960",
    county: "Adair"
  },
  "140124": {
    precinctId: "2202443",
    precinctCode: "140124",
    precinctName: "Precinct 140124",
    pollingLocation: "HILLTOP BAPTIST CHURCH",
    locationDescription: "",
    address: "11710 E STELLA RD",
    city: "NORMAN",
    zip: "73026",
    county: "Cleveland"
  },
  "140308": {
    precinctId: "2202445",
    precinctCode: "140308",
    precinctName: "Precinct 140308",
    pollingLocation: "NORMAN PUBLIC LIBRARY WEST",
    locationDescription: "",
    address: "300 NORMAN CENTER CT.",
    city: "NORMAN",
    zip: "73072",
    county: "Cleveland"
  },
  "140100": {
    precinctId: "2202581",
    precinctCode: "140100",
    precinctName: "Precinct 140100",
    pollingLocation: "MID-AMERICA CHRISTIAN UNIV.",
    locationDescription: "",
    address: "3500 SW 119 ST",
    city: "OKLAHOMA CITY",
    zip: "73170",
    county: "Cleveland"
  },
  "140103": {
    precinctId: "2202369",
    precinctCode: "140103",
    precinctName: "Precinct 140103",
    pollingLocation: "EMMAUS BAPTIST CHURCH",
    locationDescription: "",
    address: "16001 S. WESTERN AVENUE",
    city: "OKLAHOMA CITY",
    zip: "73170",
    county: "Cleveland"
  }
};
