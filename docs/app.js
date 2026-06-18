const consoleBox = document.getElementById("console");
const installButton = document.getElementById("installButton");
const bundleTitle = document.getElementById("bundleTitle");
const buildStats = document.getElementById("buildStats");
const flashMap = document.getElementById("flashMap");
const fileList = document.getElementById("fileList");
const marketUrl = document.getElementById("marketUrl");

marketUrl.textContent = new URL("deck/marketplace-index.json", window.location.href).href;

function writeConsole(lines) {
  consoleBox.textContent = lines.map((line) => "> " + line).join("\n");
}

function addStat(label, value) {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = label;
  dd.textContent = value;
  buildStats.append(dt, dd);
}

function formatOffset(offset) {
  return "0x" + Number(offset).toString(16).padStart(5, "0");
}

async function loadBuild() {
  try {
    const response = await fetch("build.json", { cache: "no-store" });
    if (!response.ok) throw new Error("build.json unavailable");
    const build = await response.json();
    const firmware = (build.files || []).find((file) => file.name === "firmware.bin");

    bundleTitle.textContent = `${build.name} ${build.version}`;
    buildStats.replaceChildren();
    addStat("Target", build.target);
    addStat("Firmware", firmware ? `${firmware.length} bytes` : "missing");
    addStat("Generated", build.generated);
    addStat("Warning", build.warning);

    flashMap.replaceChildren(...build.offsets.map((part) => {
      const item = document.createElement("li");
      item.textContent = `${formatOffset(part.offset)}  ${part.path}`;
      return item;
    }));

    fileList.replaceChildren(...build.files.map((file) => {
      const row = document.createElement("div");
      row.className = "file";
      const name = document.createElement("b");
      const meta = document.createElement("small");
      name.textContent = `${file.name} (${file.length} bytes)`;
      meta.textContent = file.sha256;
      row.append(name, meta);
      return row;
    }));

    writeConsole([
      "status: flasher ready",
      `bundle: ${build.name} ${build.version}`,
      "target: LilyGO ESP32-S3 T-Dongle",
      "flash map: bootloader + partitions + boot_app0 + app",
      "voidlink: external marketplace source is linked from the deck metadata"
    ]);
  } catch (error) {
    bundleTitle.textContent = "Build manifest failed";
    writeConsole([
      "status: build manifest failed",
      "error: " + (error.message || "unknown")
    ]);
  }
}

installButton.addEventListener("click", () => {
  writeConsole([
    "status: serial action requested",
    "next: select the T-Dongle S3 port",
    "bootloader hint: hold BOOT, tap RESET, then release BOOT",
    "warning: web flasher cannot verify your backup"
  ]);
});

loadBuild();
