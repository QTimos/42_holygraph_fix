browser.webRequest.onBeforeRequest.addListener(
        function(details) {
                let filter = browser.webRequest.filterResponseData(details.requestId);
                let decoder = new TextDecoder("utf-8");
                let encoder = new TextEncoder();

                let data = "";

                const projectsToPatch = [
                        "42next-born2beroot",
                        "42next-exam-rank-02",
                        "42next-push_swap"
                ];

                filter.ondata = event => {
                        data += decoder.decode(event.data, {stream: true});
                };

                filter.onstop = event => {
                        try {
                                let json = JSON.parse(data);

                                const patchContent = (obj) => {
                                        if (Array.isArray(obj)) {
                                                return obj.map(item => {
                                                        if (projectsToPatch.includes(item.slug)) {
                                                                console.log(`[42 Patcher] Patching project: ${item.slug}`);
                                                                return { ...item, state: "done" };
                                                        }
                                                        return item;
                                                });
                                        }
                                        return obj;
                                };

                                let modifiedJson = patchContent(json);
                                filter.write(encoder.encode(JSON.stringify(modifiedJson)));
                        } catch (e) {
                                console.error("[42 Patcher] Error parsing JSON:", e);
                                filter.write(encoder.encode(data));
                        }
                        filter.close();
                };

                return {};
        },
        { urls: ["https://projects.intra.42.fr/project_data.json*"] },
        ["blocking"]
);
