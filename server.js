const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "lokasi.html"));
});

app.use(express.static(path.join(__dirname, "public")));


app.get("/api/lokasi", async (req, res) => {
    const lokasi = req.query.lokasi;
    const apiKey = "TmW3n2IbOKaZxkghOoYB";

    if (!lokasi) {
        return res.status(400).json({
            message: "Lokasi belum diisi"
        });
    }

    try {
        const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(lokasi)}.json?key=${apiKey}`;

        const response = await axios.get(url);

        if (response.data.features.length === 0) {
            return res.status(404).json({
                message: "Lokasi tidak ditemukan"
            });
        }

        const data = response.data.features[0];
        
        console.log(JSON.stringify(data, null, 2));

        let negara = "";
        let provinsi = "";
        let kecamatan = "";

        data.context?.forEach(item => {
            if (item.id.startsWith("country")) {
                negara = item.text;
            }

            if (item.id.startsWith("region")) {
                provinsi = item.text;
            }

            if (item.id.startsWith("district")) {
                kecamatan = item.text;
            }
        });

        res.json({
            lokasi: data.text,
            negara: negara,
            provinsi: provinsi,
            kecamatan: kecamatan,
            longitude: data.geometry.coordinates[0],
            latitude: data.geometry.coordinates[1]
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Gagal mengambil data dari MapTiler"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
