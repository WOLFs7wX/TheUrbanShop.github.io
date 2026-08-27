/* ============================================================
   URBANSHOP GLOBAL 3D
   VERSIÓN ESTABLE
   ============================================================ */

import * as THREE from "three";

import {
    OrbitControls
} from "three/addons/controls/OrbitControls.js";


/* ============================================================
   CONFIGURACIÓN
   ============================================================ */

const CONFIG = {

    radius: 5,

    routeRadius: 5.65,

    productRadius: 5.85,

    atmosphereRadius: 5.18,

    autoRotateSpeed: 0.22,

    mapURL:
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

};


/* ============================================================
   CONTENEDOR
   ============================================================ */

const container =
    document.getElementById(
        "globe-container"
    );


if (!container) {

    throw new Error(
        "No existe #globe-container"
    );

}


/* ============================================================
   ESCENA
   ============================================================ */

const scene =
    new THREE.Scene();


/* ============================================================
   CÁMARA
   ============================================================ */

const camera =
    new THREE.PerspectiveCamera(

        42,

        container.clientWidth /
        container.clientHeight,

        0.1,

        1000

    );


camera.position.set(
    0,
    0,
    14
);


/* ============================================================
   RENDERER
   ============================================================ */

const renderer =
    new THREE.WebGLRenderer({

        antialias:
            true,

        alpha:
            true,

        powerPreference:
            "high-performance"

    });


renderer.setPixelRatio(

    Math.min(
        window.devicePixelRatio,
        2
    )

);


renderer.setSize(

    container.clientWidth,

    container.clientHeight

);


renderer.outputColorSpace =
    THREE.SRGBColorSpace;


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.2;


renderer.domElement.style.display =
    "block";


container.appendChild(
    renderer.domElement
);


/* ============================================================
   CONTROLES
   ============================================================ */

const controls =
    new OrbitControls(

        camera,

        renderer.domElement

    );


controls.enableDamping =
    true;


controls.dampingFactor =
    0.045;


controls.enablePan =
    false;


controls.enableZoom =
    true;


controls.minDistance =
    7;


controls.maxDistance =
    22;


controls.rotateSpeed =
    0.55;


controls.autoRotate =
    true;


controls.autoRotateSpeed =
    CONFIG.autoRotateSpeed;


/* ============================================================
   LUCES
   ============================================================ */

const ambientLight =
    new THREE.AmbientLight(

        0x67eaff,

        0.4

    );


scene.add(
    ambientLight
);


const light =
    new THREE.DirectionalLight(

        0xffffff,

        1.8

    );


light.position.set(
    7,
    5,
    10
);


scene.add(
    light
);


/* ============================================================
   GRUPO DEL PLANETA
   ============================================================ */

const planetGroup =
    new THREE.Group();


scene.add(
    planetGroup
);


/* ============================================================
   PLANETA
   ============================================================ */

const globe =
    new THREE.Mesh(

        new THREE.SphereGeometry(

            CONFIG.radius,

            96,

            96

        ),

        new THREE.MeshPhongMaterial({

            color:
                0x02080d,

            emissive:
                0x03141a,

            emissiveIntensity:
                0.8,

            shininess:
                100,

            specular:
                0x43edff

        })

    );


planetGroup.add(
    globe
);


/* ============================================================
   ATMÓSFERA
   ============================================================ */

const atmosphere =
    new THREE.Mesh(

        new THREE.SphereGeometry(

            CONFIG.atmosphereRadius,

            64,

            64

        ),

        new THREE.ShaderMaterial({

            uniforms: {
                glowColor: { value: new THREE.Color(0x00eaff) }
            },

            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,

            fragmentShader: `
                uniform vec3 glowColor;
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    gl_FragColor = vec4(glowColor, clamp(intensity, 0.0, 1.0) * 1.1);
                }
            `,

            side:
                THREE.BackSide,

            blending:
                THREE.AdditiveBlending,

            transparent:
                true,

            depthWrite:
                false

        })

    );


planetGroup.add(
    atmosphere
);


/* ============================================================
   AURA EXTERNA
   ============================================================ */

const aura =
    new THREE.Mesh(

        new THREE.SphereGeometry(

            5.32,

            64,

            64

        ),

        new THREE.MeshBasicMaterial({

            color:
                0x8b2cff,

            transparent:
                true,

            opacity:
                0.025,

            side:
                THREE.BackSide,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false

        })

    );


planetGroup.add(
    aura
);


/* ============================================================
   CONTINENTES
   ============================================================ */

const countriesGroup =
    new THREE.Group();


planetGroup.add(
    countriesGroup
);


const countryMaterial =
    new THREE.LineBasicMaterial({

        color:
            0x55efff,

        transparent:
            true,

        opacity:
            0.42,

        blending:
            THREE.AdditiveBlending,

        depthWrite:
            false

    });


/* ============================================================
   CONVERSIÓN GEOGRÁFICA
   ============================================================ */

function latLng(

    latitude,

    longitude,

    radius

) {

    const phi =
        THREE.MathUtils.degToRad(

            90 -
            latitude

        );


    const theta =
        THREE.MathUtils.degToRad(

            longitude +
            180

        );


    return new THREE.Vector3(

        -radius *
        Math.sin(phi) *
        Math.cos(theta),

        radius *
        Math.cos(phi),

        radius *
        Math.sin(phi) *
        Math.sin(theta)

    );

}


/* ============================================================
   DIBUJAR LÍNEA DE PAÍS
   ============================================================ */

function drawCountryLine(
    coordinates
) {

    if (
        !coordinates ||
        coordinates.length < 2
    ) {

        return;

    }


    const points = [];


    coordinates.forEach(

        coordinate => {

            const longitude =
                coordinate[0];


            const latitude =
                coordinate[1];


            points.push(

                latLng(

                    latitude,

                    longitude,

                    CONFIG.radius *
                    1.012

                )

            );

        }

    );


    if (
        points.length < 2
    ) {

        return;

    }


    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );


    const line =
        new THREE.Line(

            geometry,

            countryMaterial

        );


    countriesGroup.add(
        line
    );

}


/* ============================================================
   CARGAR MAPA REAL
   ============================================================ */

async function loadCountries() {

    try {

        const response =
            await fetch(
                CONFIG.mapURL
            );


        if (!response.ok) {

            throw new Error(
                "No se pudo descargar el mapa"
            );

        }


        const topology =
            await response.json();


        /*
         * Convertimos TopoJSON a GeoJSON
         * sin depender de otro paquete.
         */

        const objects =
            topology.objects;


        const world =
            objects.countries;


        if (!world) {

            throw new Error(
                "No existe countries en el mapa"
            );

        }


        const geometries =
            world.geometries;


        geometries.forEach(

            geometry => {

                if (
                    geometry.type ===
                    "Polygon"
                ) {

                    geometry.arcs.forEach(

                        arc => {

                            drawArc(
                                arc,
                                topology
                            );

                        }

                    );

                }


                if (
                    geometry.type ===
                    "MultiPolygon"
                ) {

                    geometry.arcs.forEach(

                        polygon => {

                            polygon.forEach(

                                arc => {

                                    drawArc(
                                        arc,
                                        topology
                                    );

                                }

                            );

                        }

                    );

                }

            }

        );


        console.log(
            "🌎 Mapa mundial cargado"
        );

    }

    catch (error) {

        console.warn(
            "Mapa mundial no disponible:",
            error
        );

        /*
         * El planeta continúa funcionando
         * aunque el mapa falle.
         */

    }

}


/* ============================================================
   DECODIFICAR ARC
   ============================================================ */

function drawArc(
    arcIndexes,
    topology
) {

    /*
     * Algunos mapas usan índices directos
     * y otros arcos negativos.
     */

    if (
        !Array.isArray(
            arcIndexes
        )
    ) {

        return;

    }


    const allCoordinates = [];


    arcIndexes.forEach(

        index => {

            let arcIndex =
                index;


            let reversed =
                false;


            if (
                arcIndex < 0
            ) {

                arcIndex =
                    ~arcIndex;

                reversed =
                    true;

            }


            const arc =
                topology.arcs[
                    arcIndex
                ];


            if (!arc) {
                return;
            }


            let x = 0;
            let y = 0;


            const coordinates = [];


            arc.forEach(

                point => {

                    x += point[0];
                    y += point[1];


                    coordinates.push([

                        x,
                        y

                    ]);

                }

            );


            if (reversed) {

                coordinates.reverse();

            }


            allCoordinates.push(
                ...coordinates
            );

        }

    );


    /*
     * Transformación aproximada de
     * coordenadas TopoJSON.
     */

    const transform =
        topology.transform;


    if (!transform) {
        return;
    }


    const converted = [];


    allCoordinates.forEach(

        point => {

            const longitude =
                point[0] *
                transform.scale[0] +
                transform.translate[0];


            const latitude =
                point[1] *
                transform.scale[1] +
                transform.translate[1];


            converted.push([

                longitude,
                latitude

            ]);

        }

    );


    drawCountryLine(
        converted
    );

}


loadCountries();


/* ============================================================
   ESTRELLAS
   ============================================================ */

const starGeometry =
    new THREE.BufferGeometry();


const starPositions = [];


for (
    let i = 0;
    i < 1300;
    i++
) {

    const radius =
        THREE.MathUtils.randFloat(
            20,
            65
        );


    const theta =
        Math.random() *
        Math.PI *
        2;


    const phi =
        Math.acos(

            THREE.MathUtils.randFloat(
                -1,
                1
            )

        );


    starPositions.push(

        radius *
        Math.sin(phi) *
        Math.cos(theta),

        radius *
        Math.cos(phi),

        radius *
        Math.sin(phi) *
        Math.sin(theta)

    );

}


starGeometry.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(

        starPositions,

        3

    )

);


const starMaterial =
    new THREE.PointsMaterial({

        color:
            0xd5faff,

        size:
            0.045,

        transparent:
            true,

        opacity:
            0.75,

        sizeAttenuation:
            true

    });


const stars =
    new THREE.Points(

        starGeometry,

        starMaterial

    );


scene.add(
    stars
);


/* ============================================================
   PRODUCTOS
   ============================================================ */

const products = [

    {

        id:
            1,

        name:
            "Humidificador de Fogata",

        icon:
            "💧",

        color:
            0x00eaff,

        start:
            [39.9042, 116.4074],

        end:
            [4.7110, -74.0721]

    },


    {

        id:
            2,

        name:
            "Proyector Gamer",

        icon:
            "🎮",

        color:
            0xff25d9,

        start:
            [40.7128, -74.0060],

        end:
            [4.7110, -74.0721]

    },


    {

        id:
            3,

        name:
            "Memoria USB",

        icon:
            "💾",

        color:
            0x7d5cff,

        start:
            [51.5074, -0.1278],

        end:
            [4.7110, -74.0721]

    },


    {

        id:
            4,

        name:
            "Accesorio Tecnológico",

        icon:
            "⚡",

        color:
            0x39ff88,

        start:
            [35.6762, 139.6503],

        end:
            [4.7110, -74.0721]

    },


    {

        id:
            5,

        name:
            "Producto UrbanShop",

        icon:
            "📦",

        color:
            0xff8d2e,

        start:
            [-23.5505, -46.6333],

        end:
            [4.7110, -74.0721]

    }

];

const CIUDADES_ORIGEN = [
    [35.6762, 139.6503],
    [51.5074, -0.1278],
    [40.7128, -74.0060],
    [-33.8688, 151.2093],
    [55.7558, 37.6173],
    [19.4326, -99.1332],
    [-23.5505, -46.6333],
    [25.2048, 55.2708],
    [1.3521, 103.8198],
    [48.8566, 2.3522]
];

const DESTINO_HUB = [4.7110, -74.0721];

const COLORES_ACTIVIDAD = [0x00eaff, 0xff25d9, 0x7d5cff, 0x39ff88, 0xff8d2e];

const activityRoutes = [];

/* ============================================================
   RUTAS
   ============================================================ */

const routes = [];


/* ============================================================
   OBJETOS SELECCIONABLES
   IMPORTANTE:
   Se declara ANTES de crear las rutas.
   ============================================================ */

const selectableObjects = [];


/* ============================================================
   CREAR CURVA
   ============================================================ */

function createCurve(

    start,

    end

) {

    const midpoint =
        start.clone()
            .add(end)
            .normalize()
            .multiplyScalar(
                7.3
            );


    return new THREE.CatmullRomCurve3([

        start,

        midpoint,

        end

    ]);

}


/* ============================================================
   ICONO
   ============================================================ */

function createIconTexture(

    icon,

    color

) {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        128;

    canvas.height =
        128;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.clearRect(
        0,
        0,
        128,
        128
    );


    ctx.beginPath();


    ctx.arc(

        64,
        64,
        45,
        0,
        Math.PI * 2

    );


    ctx.fillStyle =
        "rgba(3,9,20,.94)";


    ctx.fill();


    ctx.shadowBlur =
        25;


    ctx.shadowColor =
        "#" +
        color.toString(
            16
        ).padStart(
            6,
            "0"
        );


    ctx.strokeStyle =
        "#ffffff";


    ctx.lineWidth =
        3;


    ctx.stroke();


    ctx.shadowBlur =
        15;


    ctx.font =
        "52px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillStyle =
        "#ffffff";


    ctx.fillText(

        icon,

        64,

        66

    );


    return new THREE.CanvasTexture(
        canvas
    );

}


/* ============================================================
   CREAR PUNTO LOGÍSTICO
   ============================================================ */

function createPoint(

    position,

    color

) {

    const group =
        new THREE.Group();


    group.position.copy(
        position
    );


    const core =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                .055,

                16,

                16

            ),

            new THREE.MeshBasicMaterial({

                color:
                    color

            })

        );


    group.add(
        core
    );


    const glow =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                .18,

                16,

                16

            ),

            new THREE.MeshBasicMaterial({

                color:
                    color,

                transparent:
                    true,

                opacity:
                    .17,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false

            })

        );


    group.add(
        glow
    );


    planetGroup.add(
        group
    );


    return group;

}


/* ============================================================
   CREAR RUTA
   ============================================================ */

function createRoute(

    product,

    index

) {

    const start =
        latLng(

            product.start[0],

            product.start[1],

            CONFIG.routeRadius

        );


    const end =
        latLng(

            product.end[0],

            product.end[1],

            CONFIG.routeRadius

        );


    const curve =
        createCurve(
            start,
            end
        );


    const points =
        curve.getPoints(
            100
        );


    /* --------------------------------------------------------
       LÍNEA PRINCIPAL
       -------------------------------------------------------- */

    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );


    const material =
        new THREE.LineBasicMaterial({

            color:
                product.color,

            transparent:
                true,

            opacity:
                .78,

            blending:
                THREE.AdditiveBlending,

            depthWrite:
                false

        });


    const line =
        new THREE.Line(

            geometry,

            material

        );


    planetGroup.add(
        line
    );


    /* --------------------------------------------------------
       GLOW
       -------------------------------------------------------- */

    const glow =
        new THREE.Line(

            geometry.clone(),

            new THREE.LineBasicMaterial({

                color:
                    product.color,

                transparent:
                    true,

                opacity:
                    .16,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false

            })

        );


    glow.scale.setScalar(
        1.035
    );


    planetGroup.add(
        glow
    );


    /* --------------------------------------------------------
       ORIGEN
       -------------------------------------------------------- */

    const origin =
        createPoint(

            start,

            product.color

        );


    /* --------------------------------------------------------
       DESTINO
       -------------------------------------------------------- */

    const destination =
        createPoint(

            end,

            product.color

        );


    /* --------------------------------------------------------
       PRODUCTO
       -------------------------------------------------------- */

    const texture =
        createIconTexture(

            product.icon,

            product.color

        );


    const sprite =
        new THREE.Sprite(

            new THREE.SpriteMaterial({

                map:
                    texture,

                transparent:
                    true,

                depthWrite:
                    false,

                blending:
                    THREE.AdditiveBlending

            })

        );


    sprite.scale.set(
        .72,
        .72,
        .72
    );


    planetGroup.add(
        sprite
    );


    /* --------------------------------------------------------
       VIAJERO
       -------------------------------------------------------- */

    const traveler =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                .075,

                16,

                16

            ),

            new THREE.MeshBasicMaterial({

                color:
                    product.color,

                blending:
                    THREE.AdditiveBlending

            })

        );


    planetGroup.add(
        traveler
    );


    /* --------------------------------------------------------
       GLOW DEL VIAJERO
       -------------------------------------------------------- */

    const travelerGlow =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                .19,

                16,

                16

            ),

            new THREE.MeshBasicMaterial({

                color:
                    product.color,

                transparent:
                    true,

                opacity:
                    .18,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false

            })

        );


    planetGroup.add(
        travelerGlow
    );


    /* --------------------------------------------------------
       HALO
       -------------------------------------------------------- */

    const halo =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                .12,

                16,

                16

            ),

            new THREE.MeshBasicMaterial({

                color:
                    product.color,

                transparent:
                    true,

                opacity:
                    .22,

                blending:
                    THREE.AdditiveBlending,

                depthWrite:
                    false

            })

        );


    planetGroup.add(
        halo
    );


    /* --------------------------------------------------------
       RUTA
       -------------------------------------------------------- */

    const trailMeshes = [];

    for (let i = 0; i < 5; i++) {

        const trailMesh = new THREE.Mesh(

            new THREE.SphereGeometry(.045 - i * .005, 10, 10),

            new THREE.MeshBasicMaterial({
                color: product.color,
                transparent: true,
                opacity: .5 - i * .09,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })

        );

        planetGroup.add(trailMesh);
        trailMeshes.push(trailMesh);

    }


    const route = {

        product,

        curve,

        line,

        glow,

        origin,

        destination,

        sprite,

        traveler,

        travelerGlow,

        halo,

        trailMeshes,

        t:
            (index * .19) % 1,

        speed:
            .00030 +
            Math.random() * .00025,

        phase:
            Math.random() *
            Math.PI *
            2

    };


    routes.push(
        route
    );


    /* --------------------------------------------------------
       SELECCIÓN
       -------------------------------------------------------- */

    sprite.userData.route =
        route;


    traveler.userData.route =
        route;


    halo.userData.route =
        route;


    selectableObjects.push(
        sprite
    );


    selectableObjects.push(
        traveler
    );


    selectableObjects.push(
        halo
    );

}


/* ============================================================
   CREAR RUTAS
   ============================================================ */

products.forEach(

    (product, index) => {

        createRoute(
            product,
            index
        );

    }

    
);

function crearRutaActividad() {

    const origen = CIUDADES_ORIGEN[Math.floor(Math.random() * CIUDADES_ORIGEN.length)];
    const color = COLORES_ACTIVIDAD[Math.floor(Math.random() * COLORES_ACTIVIDAD.length)];

    const start = latLng(origen[0], origen[1], CONFIG.routeRadius);
    const end = latLng(DESTINO_HUB[0], DESTINO_HUB[1], CONFIG.routeRadius);
    const curve = createCurve(start, end);
    const points = curve.getPoints(80);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const line = new THREE.Line(geometry, material);
    planetGroup.add(line);

    const traveler = new THREE.Mesh(
        new THREE.SphereGeometry(.06, 12, 12),
        new THREE.MeshBasicMaterial({ color: color, blending: THREE.AdditiveBlending })
    );
    planetGroup.add(traveler);

    const travelerGlow = new THREE.Mesh(
        new THREE.SphereGeometry(.15, 12, 12),
        new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: .2,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    planetGroup.add(travelerGlow);

    activityRoutes.push({
        curve,
        line,
        traveler,
        travelerGlow,
        t: 0,
        speed: .0022 + Math.random() * .0015
    });

}

function programarSiguienteActividad() {

    const espera = 2200 + Math.random() * 2800;

    setTimeout(() => {

        if (activityRoutes.length < 4) {
            crearRutaActividad();
        }

        programarSiguienteActividad();

    }, espera);

}

programarSiguienteActividad();

/* ============================================================
   RAYCASTER
   ============================================================ */

const raycaster =
    new THREE.Raycaster();


const mouse =
    new THREE.Vector2();


/* ============================================================
   PANEL
   ============================================================ */

function showProduct(
    product
) {

    const panel =
        document.getElementById(
            "shipment-panel"
        );


    const name =
        document.getElementById(
            "panel-product-name"
        );


    const icon =
        document.getElementById(
            "panel-icon"
        );


    if (name) {

        name.textContent =
            product.name;

    }


    if (icon) {

        icon.textContent =
            product.icon;

    }


    panel.classList.add(
        "active"
    );

}


/* ============================================================
   CLICK
   ============================================================ */

renderer.domElement.addEventListener(

    "pointerdown",

    event => {

        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                (
                    event.clientX -
                    rect.left
                ) /
                rect.width
            ) *
            2 -
            1;


        mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                ) /
                rect.height
            ) *
            2 +
            1;


        raycaster.setFromCamera(

            mouse,

            camera

        );


        const hits =
            raycaster.intersectObjects(

                selectableObjects,

                true

            );


        if (
            hits.length > 0
        ) {

            const route =
                hits[0].object
                    .userData
                    .route;


            if (route) {

                controls.autoRotate =
                    false;


                showProduct(
                    route.product
                );


                route.glow.material.opacity =
                    .75;


                setTimeout(

                    () => {

                        route.glow.material.opacity =
                            .16;

                    },

                    500

                );

            }

        }

    }

);


/* ============================================================
   CERRAR PANEL
   ============================================================ */

document
    .getElementById(
        "close-panel"
    )
    .addEventListener(

        "click",

        () => {

            document
                .getElementById(
                    "shipment-panel"
                )
                .classList.remove(
                    "active"
                );

        }

    );


/* ============================================================
   BOTÓN + 
   ============================================================ */

document
    .getElementById(
        "globe-plus"
    )
    .addEventListener(

        "click",

        () => {

            camera.position.multiplyScalar(
                .82
            );

        }

    );


/* ============================================================
   BOTÓN -
   ============================================================ */

document
    .getElementById(
        "globe-minus"
    )
    .addEventListener(

        "click",

        () => {

            camera.position.multiplyScalar(
                1.18
            );

        }

    );


/* ============================================================
   RESET
   ============================================================ */

document
    .getElementById(
        "globe-reset"
    )
    .addEventListener(

        "click",

        () => {

            camera.position.set(
                0,
                0,
                14
            );


            controls.target.set(
                0,
                0,
                0
            );


            controls.autoRotate =
                true;

        }

    );


/* ============================================================
   ROTACIÓN
   ============================================================ */

document
    .getElementById(
        "globe-rotate"
    )
    .addEventListener(

        "click",

        () => {

            controls.autoRotate =
                !controls.autoRotate;

        }

    );


/* ============================================================
   ANIMACIÓN
   ============================================================ */

const clock =
    new THREE.Clock();


function animate() {

    requestAnimationFrame(
        animate
    );


    const elapsed =
        clock.getElapsedTime();


    controls.update();


    /* --------------------------------------------------------
       RUTAS
       -------------------------------------------------------- */

    routes.forEach(

        route => {

            route.t +=
                route.speed;


            if (
                route.t >= 1
            ) {

                route.t =
                    0;

            }


            const point =
                route.curve.getPointAt(
                    route.t
                );


            /*
             * IMPORTANTE:
             * El producto SIEMPRE queda
             * por fuera del planeta.
             */

            const outside =
                point.clone()
                    .normalize()
                    .multiplyScalar(
                        CONFIG.productRadius
                    );


            route.traveler
                .position
                .copy(
                    outside
                );


            route.travelerGlow
                .position
                .copy(
                    outside
                );


            route.sprite
                .position
                .copy(
                    outside
                );


            route.halo
                .position
                .copy(
                    outside
                );


            /* ------------------------------------------------
               PULSO
               ------------------------------------------------ */

            const pulse =
                1 +
                Math.sin(

                    elapsed * 4 +
                    route.phase

                ) *
                .22;


            route.travelerGlow
                .scale
                .setScalar(
                    pulse
                );


            route.halo
                .scale
                .setScalar(
                    pulse
                );


            /* ------------------------------------------------
               FLOTACIÓN
               ------------------------------------------------ */

            route.sprite.position.y +=

                Math.sin(

                    elapsed * 3 +
                    route.phase

                ) *
                .015;


            /* ------------------------------------------------
               GLOW
               ------------------------------------------------ */

            route.glow.material.opacity =

                .11 +

                Math.sin(

                    elapsed * 2 +
                    route.phase

                ) *
                .04;

                            route.trailMeshes.forEach((trailMesh, i) => {

                const trailT = (((route.t - (i + 1) * .014) % 1) + 1) % 1;

                const trailPoint = route.curve.getPointAt(trailT);

                const trailOutside = trailPoint.clone()
                    .normalize()
                    .multiplyScalar(CONFIG.productRadius);

                trailMesh.position.copy(trailOutside);

            });
        }

    );

        for (let i = activityRoutes.length - 1; i >= 0; i--) {

        const actividad = activityRoutes[i];

        actividad.t += actividad.speed;

        const fadeIn = Math.min(actividad.t * 4, 1);
        const fadeOut = Math.min((1 - actividad.t) * 4, 1);

        actividad.line.material.opacity = Math.max(fadeIn * fadeOut * .5, 0);

        if (actividad.t >= 1) {

            planetGroup.remove(actividad.line);
            planetGroup.remove(actividad.traveler);
            planetGroup.remove(actividad.travelerGlow);

            actividad.line.geometry.dispose();
            actividad.line.material.dispose();
            actividad.traveler.geometry.dispose();
            actividad.traveler.material.dispose();
            actividad.travelerGlow.geometry.dispose();
            actividad.travelerGlow.material.dispose();

            activityRoutes.splice(i, 1);
            continue;

        }

        const puntoActividad = actividad.curve.getPointAt(actividad.t);

        const afueraActividad = puntoActividad.clone()
            .normalize()
            .multiplyScalar(CONFIG.productRadius);

        actividad.traveler.position.copy(afueraActividad);
        actividad.travelerGlow.position.copy(afueraActividad);

    }

    /* ========================================================
       ATMÓSFERA
       ======================================================== */

    aura.material.opacity =

        .02 +

        Math.sin(
            elapsed * .6
        ) *
        .008;


    countryMaterial.opacity =

        .32 +

        Math.sin(
            elapsed
        ) *
        .06;


    /* ========================================================
       ESTRELLAS
       ======================================================== */

    stars.rotation.y +=
        .000035;


    renderer.render(

        scene,

        camera

    );

}

function easeOutBack(x) {
    const c1 = 1.5;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const introDuracion = 2200;
const introInicio = performance.now();

camera.position.set(0, 0, 34);
planetGroup.scale.setScalar(.001);
starMaterial.opacity = 0;

function correrIntro(ahora) {

    const t = Math.min((ahora - introInicio) / introDuracion, 1);
    const suavizado = easeOutBack(t);

    camera.position.z = 34 + (14 - 34) * Math.min(t * 1.15, 1);
    planetGroup.scale.setScalar(Math.max(suavizado, .001));
    starMaterial.opacity = Math.min(t * 1.4, 1) * .75;

    if (t < 1) {
        requestAnimationFrame(correrIntro);
    }

}

requestAnimationFrame(correrIntro);

animate();


/* ============================================================
   RESPONSIVE
   ============================================================ */

function resize() {

    const width =
        container.clientWidth;


    const height =
        container.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {

        return;

    }


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    renderer.setSize(

        width,

        height

    );


    renderer.setPixelRatio(

        Math.min(
            window.devicePixelRatio,
            2
        )

    );

}


window.addEventListener(
    "resize",
    resize
);


resize();


/* ============================================================
   ESTADÍSTICAS
   ============================================================ */

function actualizarEstadisticas() {

    const rutasEl = document.getElementById('routes-count');
    const productosEl = document.getElementById('products-count');
    const origenesEl = document.getElementById('origins-count');

    if (!rutasEl || !productosEl || !origenesEl) return;

    const rutas = routes.length + activityRoutes.length;
    const productos = 4 + Math.floor(Math.random() * 6);
    const origenes = 3 + Math.floor(Math.random() * 5);

    [
        [rutasEl, rutas],
        [productosEl, productos],
        [origenesEl, origenes]

    ].forEach(([el, valor]) => {

        el.textContent = String(valor).padStart(2, '0');
        el.classList.remove('stat-pulse');
        void el.offsetWidth;
        el.classList.add('stat-pulse');

    });

}

actualizarEstadisticas();
setInterval(actualizarEstadisticas, 3500);
/* ============================================================
   API URBANSHOP
   ============================================================ */

window.UrbanShopGlobe = {

    scene,

    camera,

    renderer,

    controls,

    globe,

    routes,

    products,

    reset() {

        camera.position.set(
            0,
            0,
            14
        );


        controls.target.set(
            0,
            0,
            0
        );


        controls.autoRotate =
            true;

    },


    selectProduct(id) {

        const route =
            routes.find(

                item =>
                    item.product.id ===
                    id

            );


        if (!route) {
            return;
        }


        showProduct(
            route.product
        );

    }

};


console.log(
    "🌎 UrbanShop Global 3D funcionando correctamente."
);

(function tarjetasHolograma(){
    const tarjetas = document.querySelectorAll('.drop-card-inner');
    tarjetas.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;
            const rotX = ((y / rect.height) - 0.5) * -8;
            const rotY = ((x / rect.width) - 0.5) * 8;
            card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'rotateX(0) rotateY(0)';
        });
    });
})();