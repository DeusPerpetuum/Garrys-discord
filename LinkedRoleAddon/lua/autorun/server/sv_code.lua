util.AddNetworkString("key")
local secret = "your server secret"
local domen = "your domen" --should incliude slash in the end
net.Receive(
    "key",
    function(length, ply)
        local key = util.Base64Encode(ply:SteamID() .. "#" .. tostring(math.random(os.time(), system.SteamTime()) * math.random(1000, 9999)))
        metadata = {
            ["vip"] = 1, -- 1 is true, 0 is false
        }

        HTTP(
            {
                failed = function(reason)
                    net.Start("key")
                    net.WriteString("Error, try again")
                    net.Send(ply)
                    print("HTTP request failed", reason)
                end,
                success = function(code)
                    if code ~= 200 then return error("Something wrong " .. tostring(code), 1) end
                    local url = domen .. 'linked-role?steamID=' .. ply:SteamID() .. "&" .. "key=" .. key
                    net.Start("key")
                    net.WriteString(url)
                    net.Send(ply)
                end,
                method = "POST",
                url = domen .. "secret",
                headers = {
                    ["secret"] = secret,
                    ["key"] = key,
                    ["steamID"] = ply:SteamID(),
                    ["metadata"] = util.TableToJSON(metadata,false),
                }
            }
        )
    end
)