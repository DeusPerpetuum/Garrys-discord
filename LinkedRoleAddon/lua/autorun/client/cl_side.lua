concommand.Add('1', function()
        net.Start('key');
        net.SendToServer('');
end)

net.Receive('key', function (lenght)
    --rewrite this how you needs
    chat.AddText(net.ReadString())
end)