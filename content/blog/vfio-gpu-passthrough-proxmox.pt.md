---
title: "GPU passthrough no Proxmox via VFIO: o sofrimento que ninguém documenta"
date: 2026-05-27
draft: true
tags:
  - homelab
  - proxmox
  - vfio
  - gpu
  - virtualization
---

Esse post entra em construção. A ideia é dedicar um espaço inteiro ao caminho de fazer **GPU passthrough via VFIO** funcionar no Proxmox: o que a documentação assume, o que quebra silenciosamente, e como sair do "o kernel reclama" pra "a VM enxerga a placa e o Docker dentro dela usa CUDA limpo".

<!--more-->

## Plano (em construção)

- **IOMMU**: BIOS, kernel cmdline (`amd_iommu=on iommu=pt`), checagem de grupos, ACS override quando necessário.
- **Isolar a placa do host**: `vfio-pci.ids`, blacklist do driver nvidia, regeneração do initramfs.
- **Conferir que a GPU saiu limpa do host**: `lspci -nnk`, `dmesg | grep -i vfio`, sanity checks.
- **VM Proxmox**: hostpci config, `machine: q35`, `cpu: host`, hideflags pra GPU NVIDIA consumer, ROM dump quando preciso.
- **Conflito quando duas VMs querem a mesma placa**: o hookscript que automatiza o desligamento da VM anterior (já citado na Decisão 4 de [Montando o homelab]({{< ref "montando-o-homelab" >}})).
- **Validar dentro da VM**: `nvidia-smi`, container `--gpus all`, smoke test com Ollama.
- **Gotchas comuns**: Code 43, primary GPU vs secondary, reset bug, ACS, NVIDIA consumer locking.

Volto aqui com cada item desenvolvido, em ordem narrativa, conforme a memória for me trazendo de volta as cicatrizes.
