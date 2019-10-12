#![feature(allocator_api)]
#![feature(libc)]
#![feature(async_await)]
#![feature(alloc_layout_extra)]
extern crate alloc;

use console_error_panic_hook;
use std::panic;
use js_sys::{ArrayBuffer, Uint8Array};
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsCast;
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;
use web_sys::console;

// From reveal-rs
use i3df;
use openctm;
use serde_bytes;
use serde;
use byteorder::{ByteOrder, LittleEndian};

#[macro_use]
pub mod error;

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (console::log_1(&format!($($t)*).into()))
}


// NOTE this is a workaround because alloc_zeroed takes a lot of time
// TODO figure out why lzma-rs spends so much time calling alloc_zeroed
use std::alloc::{GlobalAlloc, Layout, System};

struct Allocator;

unsafe impl GlobalAlloc for Allocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        System.alloc(layout)
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        System.dealloc(ptr, layout)
    }
    unsafe fn alloc_zeroed(&self, layout: Layout) -> *mut u8 {
        System.alloc(layout)
    }
}

#[global_allocator]
static GLOBAL: Allocator = Allocator;

#[derive(Deserialize, Serialize)]
struct UvMap {
    //pub name: String,
    //pub filename: String,
    #[serde(with = "serde_bytes")]
    pub uv: Vec<u8>, // actually u32
}

#[derive(Deserialize, Serialize)]
struct Body {
    #[serde(with = "serde_bytes")]
    pub indices: Vec<u8>, // actually u32
    #[serde(with = "serde_bytes")]
    pub vertices: Vec<u8>, // actually f32
    pub normals: Vec<u8>, // actually f32
    pub uv_maps: Vec<UvMap>,
}

#[derive(Deserialize, Serialize)]
struct Ctm {
    pub body: Body,
}

#[wasm_bindgen]
pub fn load_ctm(array_buffer_value: JsValue) -> Result<JsValue, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    assert!(array_buffer_value.is_instance_of::<ArrayBuffer>());

    let uint8_array = Uint8Array::new(&array_buffer_value);
    let mut result = vec![0; uint8_array.byte_length() as usize];
    uint8_array.copy_to(&mut result);

    let reader = openctm::parse(std::io::Cursor::new(result)).unwrap();

    // Flatten, because this is what we expect from openctm.js as well
    let flat_vertices: Vec<f32> = reader.vertices
        .iter()
        .flat_map(|vertex| {
            vec![vertex.x, vertex.y, vertex.z]
        })
        .collect();

    let mut indices = vec![0; reader.indices.len() * 4];
    let mut vertices = vec![0; flat_vertices.len() * 4];

    LittleEndian::write_u32_into(&reader.indices[..], &mut indices[..]);
    LittleEndian::write_f32_into(&flat_vertices[..], &mut vertices[..]);

    let result = serde_wasm_bindgen::to_value(&Ctm {
        body: Body {
            indices,
            vertices,
            // TODO add uv maps and normals
            normals: Vec::new().into(),
            uv_maps: Vec::new().into(),
        }
    })?;
    Ok(result)
}

#[wasm_bindgen]
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct SectorHandle {
    sector: i3df::Sector,
}

#[wasm_bindgen]
pub fn parse_root_sector(array_buffer_value: JsValue) -> Result<SectorHandle, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    assert!(array_buffer_value.is_instance_of::<ArrayBuffer>());

    let uint8_array = Uint8Array::new(&array_buffer_value);
    let mut result = vec![0; uint8_array.byte_length() as usize];
    uint8_array.copy_to(&mut result);
    let cursor = std::io::Cursor::new(result);

    // TODO see if it is possible to simplify this so we can use the ? operator instead
    let sector = match i3df::parse_root_sector(cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e)))
    };
    Ok(SectorHandle {
        sector
    })
}

#[wasm_bindgen]
pub fn parse_sector(root_sector: &SectorHandle, array_buffer_value: JsValue) -> Result<SectorHandle, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    assert!(array_buffer_value.is_instance_of::<ArrayBuffer>());

    let uint8_array = Uint8Array::new(&array_buffer_value);
    let mut result = vec![0; uint8_array.byte_length() as usize];
    uint8_array.copy_to(&mut result);
    let cursor = std::io::Cursor::new(result);

    let attributes = match &root_sector.sector.header.attributes {
        Some(x) => x,
        None => return Err(error!("Attributes missing on root sector")),
    };

    let sector = match i3df::parse_sector(attributes, cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e)))
    };
    Ok(SectorHandle {
        sector
    })
}

#[wasm_bindgen]
pub fn convert_sector(sector: &SectorHandle) -> i3df::renderables::Sector {
    i3df::renderables::convert_sector(&sector.sector)
}

#[wasm_bindgen]
pub fn load_i3df(array_buffer_value: JsValue) -> Result<i3df::renderables::Scene, JsValue> {
    // TODO read https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/building-your-project.html
    // and see if this can be moved to one common place
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    assert!(array_buffer_value.is_instance_of::<ArrayBuffer>());

    let uint8_array = Uint8Array::new(&array_buffer_value);
    let mut result = vec![0; uint8_array.byte_length() as usize];
    uint8_array.copy_to(&mut result);
    let cursor = std::io::Cursor::new(result);

    let file_scene = match i3df::parse_scene(cursor) {
        Ok(x) => x,
        Err(e) => return Err(JsValue::from(error::ParserError::from(e)))
    };

    let scene = i3df::renderables::convert_scene(&file_scene);
    Ok(scene)
}

