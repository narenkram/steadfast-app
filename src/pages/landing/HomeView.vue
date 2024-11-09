<template>
    <div class="container-fluid py-2">
        <section class="row py-4 border border-success rounded">
            <div class="col-lg-8 mx-auto text-center">
                <img src="/steadfast_logo.png" alt="Steadfast" class="img-fluid" style="max-height: 200px;">
                <h1 class="display-3 mb-4">Steadfast</h1>
                <blockquote class="blockquote mb-5">
                    <p>
                        A free, open-source tool for index options trading.
                    </p>
                </blockquote>
                <div
                    class="col-12 mx-auto d-flex justify-content-between align-items-center">
                    <a href="https://t.me/steadfastapp" target="_blank" class="w-50 btn btn-outline text-decoration-none">
                        💬 Join Telegram Community
                    </a>
                    <RouterLink to="/steadfast" class="ms-2 w-50 btn btn-dark">
                        ⚡ Launch App
                    </RouterLink>
                </div>
                <a href="https://steadfastapp.in" target="_blank" class="w-100 mt-2 btn btn-outline text-decoration-none">
                    🌐 Visit Website
                </a>
            </div>
        </section>

        <!-- Sponsor to support development -->
        <section class="row mt-3 py-4 border border-danger rounded" style="font-family: monospace;">
            <div class="col-lg-4 d-flex flex-column justify-content-center align-items-center">
                <div class="card shadow-sm border">
                    <div class="card-body text-center">
                        <h5 class="card-title mb-3">Quick & Easy Donation</h5>
                        <img src="/scan_upi_id.jpg" alt="UPI QR Code" class="img-fluid mb-3 rounded shadow"
                            style="max-width: 200px;">
                        <div class="d-flex justify-content-center align-items-center mb-2">
                            <span class="me-2 fw-bold">Scan to donate via</span>
                            <img src="/upi_logo.png" alt="UPI Logo" class="img-fluid" style="max-width: 60px;">
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-8 mb-3 mb-lg-0">
                <h3 class="mb-3 text-danger">Support Steadfast</h3>
                <blockquote class="blockquote">
                    Join Steadfast's journey. Your support accelerates our progress and innovation.
                    Each contribution moves us forward in crafting a better trading experience for
                    our community.
                </blockquote>
                <a href="https://github.com/sponsors/narenkram" target="_blank"
                    class="btn btn-outline-danger btn-md me-2 mt-2 ">
                    Donate via GitHub
                </a>
            </div>
        </section>

    </div>
</template>