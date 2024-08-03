const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'productos.json');

app.use(express.json());

// Función para leer datos del archivo
const readDataFromFile = (callback) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            callback('Error al leer los datos.', null);
        } else {
            callback(null, JSON.parse(data));
        }
    });
};

// Función para escribir datos al archivo
const writeDataToFile = (data, callback) => {
    fs.writeFile(DATA_FILE, JSON.stringify(data), (err) => {
        if (err) {
            callback('Error al escribir los datos.');
        } else {
            callback(null);
        }
    });
};

// Leer productos
app.get('/api/productos', (req, res) => {
    readDataFromFile((err, products) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(products);
        }
    });
});

// Obtener producto por ID
app.get('/api/productos/:id', (req, res) => {
    readDataFromFile((err, products) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const product = products.find(p => p.id == req.params.id);
            if (product) {
                res.send(product);
            } else {
                res.status(404).send('Producto no encontrado.');
            }
        }
    });
});

// Crear nuevo producto
app.post('/api/productos', (req, res) => {
    readDataFromFile((err, products) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const newProduct = req.body;
            newProduct.id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push(newProduct);
            writeDataToFile(products, (err) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(201).send(newProduct);
                }
            });
        }
    });
});

// Actualizar producto
app.put('/api/productos/:id', (req, res) => {
    readDataFromFile((err, products) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const index = products.findIndex(p => p.id == req.params.id);
            if (index !== -1) {
                products[index] = { ...products[index], ...req.body };
                writeDataToFile(products, (err) => {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.send(products[index]);
                    }
                });
            } else {
                res.status(404).send('Producto no encontrado.');
            }
        }
    });
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
    readDataFromFile((err, products) => {
        if (err) {
            res.status(500).send(err);
        } else {
            const newProducts = products.filter(p => p.id != req.params.id);
            if (newProducts.length === products.length) {
                res.status(404).send('Producto no encontrado.');
            } else {
                writeDataToFile(newProducts, (err) => {
                    if (err) {
                        res.status(500).send(err);
                    } else {
                        res.status(204).send();
                    }
                });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});